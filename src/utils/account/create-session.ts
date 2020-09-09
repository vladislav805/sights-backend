import { IDatabaseBundle } from '../../database';
import { ISession } from '../../types/session';
import { createAuthKey } from './auth-key';

export const createSession = async(database: IDatabaseBundle, userId: number): Promise<ISession> => {
    const authKey = createAuthKey(userId);

    const date = Math.floor(Date.now() / 1000);

    const result = await database.apply(
        'insert into `authorize` (`authKey`, `userId`, `date`) values (?, ?, unix_timestamp(now()))',
        [authKey, userId],
    );

    return {
        userId,
        authKey,
        date,
        authId: result.insertId,
    };
};
