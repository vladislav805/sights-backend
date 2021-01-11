import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';

type IParams = {
    collectionId: number;
    sightId: number;
};

type IResult = boolean;

export default class CollectionsIsAffiliate extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            collectionId: toNumber(params.collectionId),
            sightId: toNumber(params.sightId),
        };
    }

    protected async perform(params: IParams, { database }: ICompanion): Promise<IResult> {
        const count = await database.count(
            'select count(*) as `count` from `sightCollection` where `collectionId` = ? and `sightId` = ?',
            [params.collectionId, params.sightId],
        );

        return count > 0;
    }
}
