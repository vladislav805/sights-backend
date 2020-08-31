import { IMethodCallProps, OpenMethodAPI } from '../method';
import { ISession } from '../../types/session';
import { IApiParams } from '../../types/api';
import * as mysql from 'promise-mysql';

type ISessionGetParams = {
    authKey: string;
};

const cache: Map<string, ISession> = new Map<string, ISession>();

export const getSessionByAuthKey = async(authKey: string, db: mysql.Pool): Promise<ISession | null> => {
    if (cache.has(authKey)) {
        return Promise.resolve(cache.get(authKey)!);
    }

    const query = await db.query({
        sql: 'select * from `authorize` where `authKey` = ?',
        values: [authKey],
    });

    if (query?.length) {
        const session = query[0];

        cache.set(authKey, session);

        return session;
    }

    return null;
};

export default class SessionsGet extends OpenMethodAPI<ISessionGetParams, ISession | null> {
    public handleParams(params: IApiParams, props: IMethodCallProps): ISessionGetParams {
        if (!('authKey' in params)) {
            throw new Error('Not specified authKey');
        }

        return super.handleParams(params, props);
    }

    public async perform({ authKey }: ISessionGetParams, props: IMethodCallProps): Promise<ISession | null> {
        return getSessionByAuthKey(authKey, await this.getDatabase());
    }
}
