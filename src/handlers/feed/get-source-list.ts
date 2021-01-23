import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';
import { getUsers } from '../../utils/users/get-users';
import { col } from '../execute/functions';
import { IUser } from '../../types/user';
import { toTheString } from '../../utils/to-string';

type IParams = {
    count: number;
    offset: number;
    fields: string;
};

type IResult = IApiList<IUser>;

export default class FeedGetSourceList extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        return {
            count: clamp(toNumber(params.count, 50), 1, 100),
            offset: toNumber(params.offset, 0),
            fields: toTheString(params.fields, true),
        };
    }

    protected async perform(params: IParams, companion: ICompanionPrivate): Promise<IResult> {
        const count = await companion.database.count(
            'select count(*) as `count` from `subscribe` where `userId` = ?',
            [companion.session.userId],
        );

        type IItem = {
            targetId: number;
        };

        const users = await companion.database.select<IItem>(
            'select `targetId` from `subscribe` where `subscribe`.`userId` = ? limit ?, ?',
            [companion.session.userId, params.offset, params.count],
        );


        const items = await getUsers(col(users, 'targetId'), params.fields, companion);

        return {
            count,
            items,
        };
    }
}
