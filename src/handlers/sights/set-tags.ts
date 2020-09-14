import { ICallPropsPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import setTags from '../../utils/sights/set-tags';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    sightId: number;
    tagIds: number[];
};

export default class SightsSetTags extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICallPropsPrivate): IParams {
        if (!('tagIds' in params)) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter tagIds not specified');
        }

        return {
            sightId: toNumber(params.sightId),
            tagIds: paramToArrayOf(params.tagIds as string, Number),
        };
    }

    protected async perform(params: IParams, props: ICallPropsPrivate): Promise<boolean> {
        return setTags(props, params.sightId, params.tagIds);
    }
}
