import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IUser, Sex } from '../../types/user';
import { ApiParam, IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { inRange } from '../../utils/in-range';
import { toNumber } from '../../utils/to-number';
import { wrapIdentify } from '../../utils/sql-packer-id';
import { ITelegramAuthResult } from '../../utils/telegram/types';
import { checkTelegramHash } from '../../utils/telegram/check-hash';
import { getVkToken } from '../../utils/vk/get-token';
import { getVkUser } from '../../utils/vk/get-user';
import { sendMail, SendMessageResult } from '../../utils/send-mail';
import { getConfigValue } from '../../config';
import { createHash } from 'crypto';
import { hashPassword } from '../../utils/account/password';
import { createSession } from '../../utils/account/create-session';
import { IDatabaseBundle } from '../../database';
import { ISession } from '../../types/session';
import { time } from '../../utils/time';

type IParams = {
    isSocial: boolean;
} & IUserInfo & IUserSocial;

type IUserInfo = {
    login?: string;
    password?: string;
    firstName: string;
    lastName: string;
    sex?: Sex;
    email?: string;
    cityId?: number;
    telegramId?: number;
    vkId?: number;
};

type IUserSocial = {
    vkCode?: string;
    telegramData?: ITelegramAuthResult;
};

type IResult = {
    userId: number;
    sent?: boolean;
};

const isValidValue = (str: ApiParam, min: number = 1): str is string => typeof str === 'string' && str.length >= min;

export default class AccountCreate extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParams {
        const { firstName, lastName, login, password, sex, email, cityId, vkCode, telegramData } = params;

        const isSocial = !!vkCode || !!telegramData;

        if (!isSocial) {
            if (!isValidValue(firstName, 2) || !isValidValue(lastName, 2)) {
                throw new ApiError(ErrorCode.NAME_SHORT, 'Name so shorten');
            }

            if (!isValidValue(login) || !inRange(login.length, 4, 20)) {
                throw new ApiError(ErrorCode.LOGIN_LENGTH, 'Login length will be about 4-20 symbols');
            }

            if (!isValidValue(password) || !inRange(password.length, 6, 30)) {
                throw new ApiError(ErrorCode.PASSWORD_LENGTH, 'Password length will be about 6-30 symbols');
            }

            if (![Sex.NONE, Sex.FEMALE, Sex.MALE].includes(sex as Sex)) {
                throw new ApiError(ErrorCode.SEX_UNKNOWN, 'Unknown value for sex');
            }

            if (typeof email !== 'string' || !/[A-Za-z0-9_.-]+@([a-z0-9а-яё0-9_-]+\.){1,4}([a-z]{2,8})/im.test(email)) {
                throw new ApiError(ErrorCode.INVALID_EMAIL, 'Invalid email format');
            }
        }

        return {
            isSocial,
            firstName: firstName as string,
            lastName: lastName as string,
            login: login as string,
            password: password as string,
            email: email as string,
            cityId: !isSocial ? toNumber(cityId, true) : 0,
            sex: sex as Sex,
            vkCode: vkCode as string,
            telegramData: typeof telegramData === 'string'
                ? JSON.parse(telegramData) as ITelegramAuthResult
                : undefined,
        };
    }

    protected async perform(params: IParams, props: ICallPropsOpen): Promise<IResult | ISession> {
        const { isSocial, vkCode, telegramData } = params;
        let info!: IUserInfo;

        if (isSocial) {
            if (vkCode) {
                info = await this.makeVk(vkCode);
            }

            if (telegramData) {
                info = await this.makeTelegram(telegramData);
            }
        } else {
            const { login, password, firstName, lastName = '', email, sex, cityId } = params;

            info = {
                firstName,
                lastName,
                login,
                password: hashPassword(password as string),
                email,
                sex,
            };

            if (cityId) {
                info.cityId = cityId;
            }
        }

        const columns = Object.keys(info).map(wrapIdentify);
        const values = Object.values(info);

        // Если регистрация/авторизация через соцсети, то сразу же активируем аккаунт
        if (isSocial) {
            columns.push(wrapIdentify('status'));
            values.push('USER');
        }

        const placeholders = Array(values.length).fill('?').join(', ');

        try {
            // Пытаемся создать пользователя
            const res = await props.database.apply(
                `insert into \`user\` (${columns.join(', ')}) values (${placeholders})`,
                values,
            );

            // Если всё ок, получаем его идентификатор
            const userId = res.insertId;

            // Если авторизация через соцсеть, то сразу же возвращаем сессию
            if (isSocial) {
                return this.createSocialSession(props.database, Boolean(telegramData), info.vkId ?? info.telegramId!);
            }

            // Если обычная регистрация, то шлём письмо с активацией на указанное мыло
            const now = time();
            const hash = createHash('md5')
                .update(`${userId}${now & Math.floor(Math.random() * now / 2048)}`)
                .digest('hex')
                .substring(0, 10);

            await props.database.apply(
                'insert into `activate` (`userId`, `hash`) values (?, ?)',
                [userId, hash],
            );

            const mailResult: SendMessageResult = await this.sendActivationMail(params.email as string, hash);

            return {
                userId,
                sent: mailResult.accepted.length > 0,
            };
        } catch (e) {
            // Если регистрация провалилась из-за дубликата
            if (e.errno === 1062) {
                // Какой ключ дублируется?
                const match = e.sqlMessage.match(/for key '([^']+)'/);
                const key = match[1];

                let code: ErrorCode = ErrorCode.ETC_REGISTER_ERROR;
                let message: string = 'unknown error';
                switch (key) {
                    // Мыло? Оно регнуто
                    case 'email': {
                        code = ErrorCode.EMAIL_ALREADY_REGISTERED;
                        message = 'This email already registered';
                        break;
                    }

                    // Логин? Он занят
                    case 'user_login_uindex': {
                        code = ErrorCode.LOGIN_ALREADY_TAKEN;
                        message = 'This login already taken';
                        break;
                    }

                    // Идентификатор ВК или Telegram? Аккаунт уже создан, нужно авторизоваться
                    case 'vkId':
                    case 'telegramId': {
                        const isTelegram = e.sqlMessage.includes('telegramId');

                        return this.createSocialSession(props.database, isTelegram, info.vkId ?? info.telegramId!);
                    }

                    default: {
                        console.log(e);
                    }
                }

                throw new ApiError(code, message);
            }
        }

        return {} as IResult;
    }

    // noinspection JSMethodCanBeStatic
    private async makeVk(code: string): Promise<IUserInfo> {
        const session = await getVkToken(code);

        const user = await getVkUser(session.access_token);

        return {
            vkId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            sex: [Sex.NONE, Sex.FEMALE, Sex.MALE][user.sex ?? 0],
        };
    }

    // noinspection JSMethodCanBeStatic
    private async makeTelegram(telegramData: ITelegramAuthResult): Promise<IUserInfo> {
        if (!checkTelegramHash(telegramData)) {
            throw new ApiError(ErrorCode.TELEGRAM_INVALID_HASH, 'Invalid telegram hash');
        }

        return {
            telegramId: +telegramData.id,
            firstName: telegramData.first_name,
            lastName: telegramData.last_name || '',
        };
    }

    // noinspection JSMethodCanBeStatic
    private sendActivationMail(email: string, hash: string): Promise<SendMessageResult> {
        return sendMail(email, 'Подтверждение регистрации', `Некто (надеемся, что это Вы) указал этот адрес электронной почты для регистрации на сайте Sights Map.
Для активации аккаунта, пожалуйста, перейдите по ссылке:
https://${getConfigValue('DOMAIN_MAIN')}/island/activation?hash=${hash}

Если Вы не регистрировались, просто проигнорируйте или удалите это письмо. Возможно, кто-то по ошибке ввёл Ваш адрес.`);
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Вызывается только тогда, когда такой юзер точно существует
     * Поэтому проверки на то, что такой юзер не найдется нет
     */
    private async createSocialSession(database: IDatabaseBundle, isTelegram: boolean, id: number): Promise<ISession> {
        const key = wrapIdentify(isTelegram ? 'telegramId' : 'vkId');

        const user = await database.select<IUser>(
            `select \`userId\` from \`user\` where ${key} = ?`,
            [id],
        );

        return createSession(database, user[0].userId);
    }
}
