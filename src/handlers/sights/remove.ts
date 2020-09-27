import { ICallPropsPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import getSightById from '../../utils/sights/get-sight';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    sightId: number;
};

export default class SightsRemove extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICallPropsPrivate): IParams {
        return {
            sightId: toNumber(params.sightId, 'Invalid sightId'),
        };
    }

    protected async perform(params: IParams, props: ICallPropsPrivate): Promise<boolean> {
        const sight = await getSightById(props.database, params.sightId);

        if (sight.ownerId !== props.session.userId) {
            throw new ApiError(ErrorCode.ACCESS_DENIED, 'Access denied');
        }

        const res = await props.database.apply(
            'delete from `sight` where `sightId` = ? and `ownerId` = ?',
            [params.sightId, props.session.userId],
        );

        return res.affectedRows > 0;
    }
}
