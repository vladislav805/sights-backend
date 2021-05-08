import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import getSightById from '../../utils/sights/get-sight';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    sightId: number;
};

export default class SightsRemove extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        return {
            sightId: toNumber(params.sightId, 'sightId'),
        };
    }

    protected async perform(params: IParams, companion: ICompanionPrivate): Promise<boolean> {
        const sight = await getSightById(companion.database, params.sightId);

        if (sight.ownerId !== companion.session.userId && companion.session.user?.status !== 'ADMIN') {
            throw new ApiError(ErrorCode.ACCESS_DENIED, 'Access denied');
        }

        const res = await companion.database.apply(
            'delete from `sight` where `sightId` = ? and `ownerId` = ?',
            [params.sightId, companion.session.userId],
        );

        return res.affectedRows > 0;
    }
}
