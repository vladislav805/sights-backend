import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';

type IParams = {
    collectionId: number;
};

type IResult = boolean;

export default class CollectionsRemove extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        return {
            collectionId: toNumber(params.collectionId),
        };
    }

    protected async perform(params: IParams, companion: ICompanionPrivate): Promise<IResult> {
        const result = await companion.database.apply(
            'delete from `collection` where `ownerId` = ? and `collectionId` = ? and `type` != \'SYSTEM\'',
            [companion.session.userId, params.collectionId],
        );

        return result.affectedRows > 0;
    }
}
