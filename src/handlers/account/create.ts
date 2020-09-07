import { IMethodCallProps, OpenMethodAPI } from '../method';
import { Sex } from '../../types/user';
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
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
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

    protected async perform(params: IParams, props: IMethodCallProps): Promise<IResult> {
        const { isSocial, vkCode, telegramData } = params;
        let info: IUserInfo;

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
                password,
                email,
                sex,
            };

            if (cityId) {
                info.cityId = cityId;
            }
        }

        const columns = Object.keys(info!).map(wrapIdentify).join(', ');
        const values = Object.values(info!);
        const placeholders = Array(values.length).fill('?').join(', ');

        try {
            const res = await props.database.apply(
                `insert into \`user\` (${columns}) values (${placeholders})`,
                values,
            );

            const result: IResult = {
                userId: res.insertId,
            };

            if (!isSocial) {
                const now = Date.now();
                const hash = createHash('md5')
                    .update(`${result.userId}${now & Math.floor(Math.random() * now / 2048)}`)
                    .digest('hex')
                    .substring(0, 10);

                await props.database.apply(
                    'insert into `activate` (`userId`, `hash`) values (?, ?)',
                    [result.userId, hash],
                );

                const mailResult: SendMessageResult = await this.sendActivationMail(params.email as string, hash);

                result.sent = mailResult.accepted.length > 0;
            }

            return result;
        } catch (e) {
            if (e.errno === 1062) {
                const match = e.sqlMessage.match(/for key '([^']+)'/);
                const key = match[1];

                let code: ErrorCode = ErrorCode.ETC_REGISTER_ERROR;
                let message: string = 'unknown error';
                switch (key) {
                    case 'email': {
                        code = ErrorCode.EMAIL_ALREADY_REGISTERED;
                        message = 'This email already registered';
                        break;
                    }

                    case 'user_login_uindex': {
                        code = ErrorCode.LOGIN_ALREADY_TAKEN;
                        message = 'This login already taken';
                        break;
                    }

                    case 'vkId':
                    case 'telegramId': {
                        const isTelegram = e.sqlMessage.includes('telegramId');
                        code = ErrorCode.ACCOUNT_TAKEN;
                        message = `Account already exists associated with this ${isTelegram ? 'Telegram' : 'VK'} account`
                        break;
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
}
