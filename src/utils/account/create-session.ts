import { IDatabaseBundle } from '../../database';
import { ISession } from '../../types/session';
import { createAuthKey } from './auth-key';
import { time } from '../time';

export const createSession = async(database: IDatabaseBundle, userId: number): Promise<ISession> => {
    const authKey = createAuthKey(userId);

    const date = time();

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
