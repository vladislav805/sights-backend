import { ICompanion, OpenMethodAPI } from '../method';
import { ISession } from '../../types/session';
import { IApiParams } from '../../types/api';
import { inRange } from '../../utils/in-range';
import { ApiError, ErrorCode } from '../../error';
import { IUser } from '../../types/user';
import { createSession } from '../../utils/account/create-session';
import { hashPassword } from '../../utils/account/password';

type IParams = {
    login: string;
    password: string;
};

type IResult = ISession & { user: IUser };

export default class AccountAuthorize extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const login = String(params.login ?? '').toLowerCase();
        const password = String(params.password ?? '');

        if (!inRange(login.length, 4, 20)) {
            throw new ApiError(ErrorCode.LOGIN_LENGTH, 'Invalid login length');
        }

        if (!inRange(password.length, 6, 30)) {
            throw new ApiError(ErrorCode.PASSWORD_LENGTH, 'Invalid password length');
        }

        return { login, password };
    }

    protected async perform({ login, password }: IParams, companion: ICompanion): Promise<IResult> {
        const result = await companion.database.select<IUser>(
            'select `userId`, `status` from `user` where (`login` = ? or `email` = ?) and `password` = ?',
            [login, login, hashPassword(password)],
        );

        if (!result.length) {
            throw new ApiError(ErrorCode.INVALID_PAIR_AUTH, 'Invalid login and password');
        }

        const { userId, status } = result[0];

        if (status === 'INACTIVE') {
            throw new ApiError(ErrorCode.ACCOUNT_NOT_ACTIVE, 'Account is not active');
        }

        if (status === 'BANNED') {
            throw new ApiError(ErrorCode.ACCOUNT_BANNED, 'Account is banned');
        }

        return Promise.all([
            createSession(companion.database, userId),
            companion.callMethod<IUser[]>('users.get', { userIds: userId, fields: 'ava' })
                .then(users => users[0]),
        ]).then(([session, user]) => ({ ...session, user }));
    }
}
