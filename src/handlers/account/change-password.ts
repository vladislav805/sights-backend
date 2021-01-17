import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { hashPassword } from '../../utils/account/password';
import { createSession } from '../../utils/account/create-session';
import { toTheString } from '../../utils/to-string';

type IParams = {
    oldPassword: string;
    newPassword: string;
};

type IResponse = {
    authKey: string;
};

export default class AccountChangePassword extends PrivateMethodAPI<IParams, IResponse> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const oldPassword = toTheString(params.oldPassword, null, 'oldPassword');
        const newPassword = toTheString(params.newPassword, null, 'newPassword');

        if (oldPassword.length < 6 || newPassword.length < 6) {
            throw new ApiError(ErrorCode.PASSWORD_LENGTH, 'Short password');
        }

        return {
            oldPassword,
            newPassword,
        };
    }

    protected async perform(params: IParams, props: ICompanionPrivate): Promise<IResponse> {
        const result = await props.database.apply(
            'update `user` set `password` = ? where `userId` = ? and `password` = ?',
            [
                hashPassword(params.newPassword),
                props.session.userId,
                hashPassword(params.oldPassword),
            ],
        );

        if (!result.affectedRows) {
            throw new ApiError(ErrorCode.INVALID_PASSWORD, 'Invalid password');
        }

        await props.database.apply(
            'delete from `authorize` where `userId` = ?',
            [props.session.userId],
        );

        const session = await createSession(props.database, props.session.userId);

        return {
            authKey: session.authKey,
        };
    }
}
