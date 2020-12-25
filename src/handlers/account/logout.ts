import { ICompanion, PrivateMethodAPI } from '../method';
import { ISession } from '../../types/session';
import { IUser } from '../../types/user';
import { removeSessionFromCache } from '../../session';

type IParams = unknown;

type IResult = boolean;

export default class AccountLogout extends PrivateMethodAPI<IParams, IResult> {
    protected async perform(params: IParams, companion: ICompanion<ISession>): Promise<IResult> {
        const authKey = companion.session.authKey;

        await companion.database.select<IUser>(
            'delete from `authorize` where `authKey` = ?',
            [authKey],
        );

        removeSessionFromCache(authKey);

        return true;
    }
}
