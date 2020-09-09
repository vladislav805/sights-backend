import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { ISession } from '../../types/session';
import { IApiParams } from '../../types/api';
import { select } from '../../database';
import { ApiError, ErrorCode } from '../../error';
import { packIdentitiesToSql, unpackObject } from '../../utils/sql-packer-id';
import { USER_KEYS } from '../users/keys';
import { IUser } from '../../types/user';

type ISessionGetParams = {
    authKey: string;
};

const cache: Map<string, ISession> = new Map<string, ISession>();

export const getSessionByAuthKey = async(authKey: string): Promise<ISession | null> => {
    if (cache.has(authKey)) {
        return Promise.resolve(cache.get(authKey)!);
    }

    const query = await select<ISession>(
        `select \`authorize\`.*, ${packIdentitiesToSql('user', 'u', USER_KEYS)} from \`authorize\` left join \`user\` on \`authorize\`.\`userId\` = \`user\`.\`userId\` where \`authKey\` = ?`,
        [authKey],
    );

    if (query?.length) {
        const session = query[0];

        session.user = unpackObject<ISession, IUser>(session, 'u', USER_KEYS);

        cache.set(authKey, session);

        return session;
    }

    return null;
};

export default class SessionsGet extends OpenMethodAPI<ISessionGetParams, ISession | null> {
    protected handleParams(params: IApiParams, props: ICallPropsOpen): ISessionGetParams {
        if (!('authKey' in params)) {
            throw new ApiError(ErrorCode.AUTH_KEY_NOT_SPECIFIED, 'Not specified authKey');
        }

        return super.handleParams(params, props);
    }

    protected async perform({ authKey }: ISessionGetParams, props: ICallPropsOpen): Promise<ISession | null> {
        return getSessionByAuthKey(authKey);
    }
}
