import { ICompanion, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { toBoolean } from '../../utils/to-boolean';
import { ISession } from '../../types/session';
import { ICollection } from '../../types/collection';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    collectionId: number;
    sightId: number;
    affiliate: boolean;
};

type IResult = boolean;

export default class CollectionsSetAffiliation extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            collectionId: toNumber(params.collectionId),
            sightId: toNumber(params.sightId),
            affiliate: toBoolean(params.affiliate),
        };
    }

    protected async perform(params: IParams, companion: ICompanion<ISession>): Promise<IResult> {
        const collection = await companion.callMethod<ICollection>('collections.getById', {
            collectionId: params.collectionId,
            onlyInformation: true,
        });

        if (collection.ownerId !== companion.session.userId) {
            throw new ApiError(ErrorCode.ACCESS_DENIED, 'Access denied');
        }

        const sql = params.affiliate
            ? 'insert into `sightCollection` (`collectionId`, `sightId`) values (?, ?)'
            : 'delete from `sightCollection` where `collectionId` = ? and `sightId` = ?';

        try {
            const result = await companion.database.apply(
                sql,
                [params.collectionId, params.sightId],
            );

            return params.affiliate
                ? result.insertId > 0
                : result.affectedRows > 0;
        } catch (e) {
            if (e.message.includes('Duplicate')) {
                return true;
            }

            throw new ApiError(ErrorCode.UNKNOWN);
        }
    }
}
