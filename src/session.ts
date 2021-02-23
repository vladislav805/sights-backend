import { ISession } from './types/session';
import { IDatabaseBundle } from './database';
import { packIdentitiesToSql, unpackObject, wrapIdentify } from './utils/sql-packer-id';
import { USER_KEYS } from './handlers/users/keys';
import { IUser } from './types/user';

const sessionCache: Map<string, ISession> = new Map<string, ISession>();
const telegramCache: Map<number, IUser> = new Map<number, IUser>();

export const getSessionByAuthKey = async(authKey: string, database: IDatabaseBundle): Promise<ISession | null> => {
    if (sessionCache.has(authKey)) {
        return Promise.resolve(sessionCache.get(authKey)!);
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

    sessionCache.set(authKey, session);

    return session;
};

export const getSessionByTelegramId = async(telegramId: number, database: IDatabaseBundle): Promise<IUser | undefined> => {
    if (telegramCache.has(telegramId)) {
        return Promise.resolve(telegramCache.get(telegramId));
    }

    const query = await database.select<IUser>(
        `select ${USER_KEYS.map(wrapIdentify).join(', ')} from \`user\` where \`telegramId\` = ?`,
        [telegramId],
    );

    if (!query?.length) {
        return undefined;
    }

    const [user] = query;

    telegramCache.set(telegramId, user);

    return user;
};

export const removeSessionFromCache = (authKey: string): void => void sessionCache.delete(authKey);
export const removeUserFromTelegramCache = (userId: number): void => {
    for (const [telegramId, user] of telegramCache.entries()) {
        if (user.userId === userId) {
            telegramCache.delete(telegramId);
            break;
        }
    }
};
