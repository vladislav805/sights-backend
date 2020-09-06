import { IMethodCallProps, OpenMethodAPI } from '../method';
import { ISession } from '../../types/session';
import { IApiParams } from '../../types/api';
import { select } from '../../database';
import { ApiError, ErrorCode } from '../../error';

type ISessionGetParams = {
    authKey: string;
};

const cache: Map<string, ISession> = new Map<string, ISession>();

export const getSessionByAuthKey = async(authKey: string): Promise<ISession | null> => {
    if (cache.has(authKey)) {
        return Promise.resolve(cache.get(authKey)!);
    }

    const query = await select<ISession>('select * from `authorize` where `authKey` = ?', [authKey]);

    if (query?.length) {
        const session = query[0];

        cache.set(authKey, session);

        return session;
    }

    return null;
};

export default class SessionsGet extends OpenMethodAPI<ISessionGetParams, ISession | null> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): ISessionGetParams {
        if (!('authKey' in params)) {
            throw new ApiError(ErrorCode.AUTH_KEY_NOT_SPECIFIED, 'Not specified authKey');
        }

        return super.handleParams(params, props);
    }

    protected async perform({ authKey }: ISessionGetParams, props: IMethodCallProps): Promise<ISession | null> {
        return getSessionByAuthKey(authKey);
    }
}
