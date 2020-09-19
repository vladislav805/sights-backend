import { ICallPropsPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import getSightById from '../../utils/sights/get-sight';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    sightId: number;
    mask: number;
};

export default class SightsSetMask extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICallPropsPrivate): IParams {
        return {
            sightId: toNumber(params.sightId, 'Invalid sightId'),
            mask: toNumber(params.mask, 'Invalid mask'),
        };
    }

    protected async perform(params: IParams, props: ICallPropsPrivate): Promise<boolean> {
        const sight = await getSightById(props.database, params.sightId);

        if (sight.ownerId !== props.session.userId) {
            throw new ApiError(ErrorCode.ACCESS_DENIED, 'Access denied');
        }

        const res = await props.database.apply(
            'update `sight` set `mask` = ? where `sightId` = ? and `ownerId` = ?',
            [params.mask, params.sightId, props.session.userId],
        );

        return res.affectedRows > 0;
    }
}
