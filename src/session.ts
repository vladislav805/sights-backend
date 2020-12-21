import { ISession } from './types/session';
import { IDatabaseBundle } from './database';
import { packIdentitiesToSql, unpackObject } from './utils/sql-packer-id';
import { USER_KEYS } from './handlers/users/keys';
import { IUser } from './types/user';

const cache: Map<string, ISession> = new Map<string, ISession>();

export const getSessionByAuthKey = async(authKey: string, database: IDatabaseBundle): Promise<ISession | null> => {
    if (cache.has(authKey)) {
        return Promise.resolve(cache.get(authKey)!);
    }

    const prefix = 'u';
    const query = await database.select<ISession>(
        `select \`authorize\`.*, ${packIdentitiesToSql('user', prefix, USER_KEYS)} from \`authorize\` left join \`user\` on \`authorize\`.\`userId\` = \`user\`.\`userId\` where \`authKey\` = ?`,
        [authKey],
    );

    if (!query?.length) {
        return null;
    }

    const [session] = query;

    session.user = unpackObject<ISession, IUser>(session, prefix, USER_KEYS);

    cache.set(authKey, session);

    return session;
};
