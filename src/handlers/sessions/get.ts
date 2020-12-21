import { ICompanion, OpenMethodAPI } from '../method';
import { ISession } from '../../types/session';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { getSessionByAuthKey } from '../../session';

type ISessionGetParams = {
    authKey: string;
};

export default class SessionsGet extends OpenMethodAPI<ISessionGetParams, ISession | null> {
    protected handleParams(params: IApiParams, props: ICompanion): ISessionGetParams {
        if (!('authKey' in params)) {
            throw new ApiError(ErrorCode.AUTH_KEY_NOT_SPECIFIED, 'Not specified authKey');
        }

        return super.handleParams(params, props);
    }

    protected async perform({ authKey }: ISessionGetParams, props: ICompanion): Promise<ISession | null> {
        return getSessionByAuthKey(authKey, props.database);
    }
}
