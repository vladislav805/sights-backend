import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { ApiError, ErrorCode } from '../../error';
import setTags from '../../utils/sights/set-tags';
import getSightById from '../../utils/sights/get-sight';
import { toTheString } from '../../utils/to-string';

type IParams = {
    sightId: number;
    placeId: number;
    title: string;
    description: string;
    cityId: number | null;
    categoryId: number | null;
    tags: string[];
};

type IResult = boolean;

export default class SightsEdit extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const sightId = toNumber(params.sightId, 'sightId');
        const placeId = toNumber(params.placeId, 'placeId');
        const title = toTheString(params.title);

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
            description: toTheString(params.description, true),
            cityId: toNumber(params.cityId, true),
            categoryId: toNumber(params.categoryId, true),
            tags: paramToArrayOf(params.tags),
        };
    }

    protected async perform(params: IParams, companion: ICompanionPrivate): Promise<IResult> {
        const sight = await getSightById(companion.database, params.sightId);

        if (sight.ownerId !== companion.session.userId) {
            throw new ApiError(ErrorCode.ACCESS_DENIED, 'You cannot edit this sight');
        }

        const result = await companion.database.apply(
            'update `sight` set `placeId` = ?, `dateUpdated` = unix_timestamp(now()), `title` = ?, `description` = ?, `cityId` = ?, `categoryId` = ? where `sightId` = ?',
            [params.placeId, params.title, params.description, params.cityId, params.categoryId, params.sightId],
        );

        if (params.tags.length) {
            const tagIds = await companion.callMethod<number[]>('tags.getIdByTags', { tags: params.tags });
            await setTags(companion, sight.sightId, tagIds);
        }

        return result.affectedRows > 0;
    }
}
