import config from '../../config';
import { ICompanion, OpenMethodAPI } from '../method';
import { IUser, Sex } from '../../types/user';
import { ApiParam, IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { inRange } from '../../utils/in-range';
import { toNumber } from '../../utils/to-number';
import { wrapIdentify } from '../../utils/sql-packer-id';
import { ITelegramAuthResult } from '../../utils/telegram/types';
import { checkTelegramHash } from '../../utils/telegram/check-hash';
import { sendMail, SendMessageResult } from '../../utils/send-mail';
import { createHash } from 'crypto';
import { hashPassword } from '../../utils/account/password';
import { createSession } from '../../utils/account/create-session';
import { ISession } from '../../types/session';
import { time } from '../../utils/time';
import { getUsers } from '../../utils/users/get-users';
import { isValidLogin } from '../../utils/account/is-valid-login';
import { IVkAuthResult } from '../../utils/vk/types';
import { checkVkHash } from '../../utils/vk/check-hash';

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
    cityId?: number | null;
    telegramId?: number;
    vkId?: number;
};

type IUserSocial = {
    vkData?: IVkAuthResult;
    telegramData?: ITelegramAuthResult;
};

type IResult = {
    userId: number;
    sent?: boolean;
};

const isValidValue = (str: ApiParam, min: number = 1): str is string => typeof str === 'string' && str.length >= min;

export default class AccountCreate extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const { firstName, lastName, login, password, sex, email, cityId, vkData, telegramData } = params;

        const isSocial = !!vkData || !!telegramData;

        if (!isSocial) {
            if (!isValidValue(firstName, 2) || !isValidValue(lastName, 2)) {
                throw new ApiError(ErrorCode.NAME_SHORT, 'Name so shorten');
            }

            if (!isValidLogin(login as string)) {
                throw new ApiError(ErrorCode.LOGIN_LENGTH, 'Login length will be about 4-20 symbols and may contains only latin letters, numbers and _');
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
            cityId: !isSocial ? toNumber(cityId, true) : null,
            sex: sex as Sex,
            vkData: typeof vkData === 'string'
                ? JSON.parse(vkData) as IVkAuthResult
                : undefined,
            telegramData: typeof telegramData === 'string'
                ? JSON.parse(telegramData) as ITelegramAuthResult
                : undefined,
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IResult | ISession> {
        const { isSocial, vkData, telegramData } = params;
        let info!: IUserInfo;

        if (isSocial) {
            if (vkData) {
                info = await this.makeVk(vkData);
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
            const res = await companion.database.apply(
                `insert into \`user\` (${columns.join(', ')}) values (${placeholders})`,
                values,
            );

            // Если всё ок, получаем его идентификатор
            const userId = res.insertId;

            // Если авторизация через соцсеть, то сразу же возвращаем сессию
            if (isSocial) {
                // Такой логин пусть будет по умолчанию
                await companion.database.apply(
                    'update `user` set `login` = ? where `userId` = ?',
                    [`id${userId}`, userId],
                );

                return this.createSocialSession(
                    companion,
                    Boolean(telegramData),
                    info.vkId ?? info.telegramId!,
                );
            }

            // Если обычная регистрация, то шлём письмо с активацией на указанное мыло
            const now = time();
            const hash = createHash('md5')
                .update(`${userId}${now & Math.floor(Math.random() * now / 2048)}`)
                .digest('hex')
                .substring(0, 10);

            await companion.database.apply(
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
            console.error(e);
            if (e.errno === 1062 || e.code === 'ER_DUP_ENTRY') {
                // Какой ключ дублируется?
                const match = e.sqlMessage.match(/for key '([^']+)'/);
                const key = match[1];
                let code: ErrorCode = ErrorCode.ETC_REGISTER_ERROR;
                let message: string = 'unknown error';
                switch (key) {
                    // Мыло? Оно регнуто
                    case 'user.email': {
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
                    case 'user.vkId':
                    case 'user.telegramId': {
                        const isTelegram = e.sqlMessage.includes('telegramId');

                        return this.createSocialSession(companion, isTelegram, info.vkId ?? info.telegramId!);
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
    private async makeVk(data: IVkAuthResult): Promise<IUserInfo> {
        if (!checkVkHash(data)) {
            throw new ApiError(ErrorCode.VK_INVALID_HASH, 'Invalid vk hash');
        }

        return {
            vkId: data.uid,
            firstName: data.first_name,
            lastName: data.last_name,
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
https://${config.domain.MAIN}/island/activation?hash=${hash}

Если Вы не регистрировались, просто проигнорируйте или удалите это письмо. Возможно, кто-то по ошибке ввёл Ваш адрес.`);
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Вызывается только тогда, когда такой юзер точно существует
     * Поэтому проверки на то, что такой юзер не найдется нет
     */
    private async createSocialSession(companion: ICompanion, isTelegram: boolean, id: number): Promise<ISession> {
        const key = wrapIdentify(isTelegram ? 'telegramId' : 'vkId');

        const [shortUser] = await companion.database.select<IUser>(
            `select \`userId\` from \`user\` where ${key} = ?`,
            [id],
        );

        const session = await createSession(companion.database, shortUser.userId);
        const [user] = await getUsers([shortUser.userId], 'ava', companion);

        return { ...session, user };
    }
}
