import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ICollection } from '../../types/collection';
import { toNumber } from '../../utils/to-number';

type IParams = {
    sightId: number;
};

type IResult = ICollection[];

export default class CollectionsGetBySight extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            sightId: toNumber(params.sightId, 'sightId'),
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IResult> {
        return companion.database.select<ICollection>(
            'select `collection`.* from `collection` left join `sightCollection` on `collection`.`collectionId` = `sightCollection`.`collectionId` where `sightCollection`.`sightId` = ? and (`collection`.`ownerId` = ? or `collection`.`type` = \'PUBLIC\')',
            [params.sightId, companion.session?.userId ?? 0],
        );
    }
}
