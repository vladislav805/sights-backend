import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { ApiError, ErrorCode } from '../../error';
import setPhotos from '../../utils/sights/set-photos';

type IParams = {
    sightId: number;
    photoIds: number[];
};

export default class SightsSetPhotos extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        if (!('tagIds' in params)) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter tagIds not specified');
        }

        return {
            sightId: toNumber(params.sightId),
            photoIds: paramToArrayOf(params.photoIds as string, Number),
        };
    }

    protected async perform(params: IParams, props: ICompanionPrivate): Promise<boolean> {
        return setPhotos(props, params.sightId, params.photoIds);
    }
}
