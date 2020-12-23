import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { ApiError, ErrorCode } from '../../error';
import setTags from '../../utils/sights/set-tags';
import getSightById from '../../utils/sights/get-sight';

type IParams = {
    sightId: number;
    placeId: number;
    title: string;
    description: string;
    cityId: number | null;
    categoryId: number | null;
    tagIds: number[];
};

type IResult = boolean;

export default class SightsEdit extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const sightId = toNumber(params.sightId, -1);
        const placeId = toNumber(params.placeId, -1);
        const title = (String(params.title) ?? '').trim();

        if (!sightId || sightId < 0) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter placeId is invalid');
        }

        if (!placeId || placeId < 0) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter placeId is invalid');
        }

        if (!title || title.length < 2) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter title not specified or invalid');
        }

        return {
            sightId,
            placeId,
            title,
            description: params.description as string ?? '',
            cityId: toNumber(params.cityId, true),
            categoryId: toNumber(params.categoryId, true),
            tagIds: paramToArrayOf(params.tagIds as string, Number),
        };
    }

    protected async perform(params: IParams, props: ICompanionPrivate): Promise<IResult> {
        const sight = await getSightById(props.database, params.sightId);

        if (sight.ownerId !== props.session.userId) {
            throw new ApiError(ErrorCode.ACCESS_DENIED, 'You cannot edit this sight');
        }

        const result = await props.database.apply(
            'update `sight` set `placeId` = ?, `dateUpdated` = unix_timestamp(now()), `title` = ?, `description` = ?, `cityId` = ?, `categoryId` = ? where `sightId` = ?',
            [params.placeId, params.title, params.description, params.cityId, params.categoryId, params.sightId],
        );

        if (params.tagIds.length) {
            await setTags(props, params.sightId, params.tagIds);
        }

        return result.affectedRows > 0;
    }
}
