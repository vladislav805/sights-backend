import { ICompanionPrivate, PrivateMethodAPI } from '../method';

export default class AccountSetOnline extends PrivateMethodAPI<never, boolean> {
    protected async perform(params: never, { session, database }: ICompanionPrivate): Promise<boolean> {
        const result = await database.apply(
            'update `user` set `lastSeen` = unix_timestamp(now()) where `userId` = ?',
            [session.userId],
        );

        return result.affectedRows > 0;
    }
}
