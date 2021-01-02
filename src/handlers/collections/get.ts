import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ICollection } from '../../types/collection';
import { toNumber } from '../../utils/to-number';

type IParams = {
    ownerId: number;
    count: number; // = 50
    offset: number; // = 0
};

type IResult = IApiList<ICollection>;

export default class CollectionsGet extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            ownerId: toNumber(params.ownerId),
            count: toNumber(params.count, 50),
            offset: toNumber(params.offset, 0),
        };
    }

    protected async perform(params: IParams, { database }: ICompanion): Promise<IResult> {
        const count = await database.count(
            'select count(*) as `count` from `collection` where `ownerId` = ?',
            [params.ownerId],
        );

        const items = await database.select<ICollection>(
            'select * from `collection` where `ownerId` = ? limit ?, ?',
            [params.ownerId, params.offset, params.count],
        );

        return {
            count,
            items,
        };
    }
}
