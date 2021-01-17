import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { ApiError, ErrorCode } from '../../error';
import setTags from '../../utils/sights/set-tags';
import { toTheString } from '../../utils/to-string';

type IParams = {
    placeId: number;
    title: string;
    description: string;
    cityId: number | null;
    categoryId: number | null;
    tags: string[];
};

type IResult = {
    sightId: number;
};

export default class SightsAdd extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const placeId = toNumber(params.placeId, 'placeId');

        if (placeId < 0) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter placeId is invalid');
        }

        if (!params.title || typeof params.title !== 'string' || params.title.trim().length < 2) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter title not specified or invalid');
        }

        return {
            placeId: toNumber(params.placeId),
            title: toTheString(params.title),
            description: toTheString(params.description),
            cityId: toNumber(params.cityId, true),
            categoryId: toNumber(params.categoryId, true),
            tags: paramToArrayOf(params.tags),
        };
    }

    protected async perform(params: IParams, companion: ICompanionPrivate): Promise<IResult> {
        const result = await companion.database.apply(
            'insert into `sight` (`ownerId`, `placeId`, `dateCreated`, `title`, `description`, `cityId`, `categoryId`) values (?, ?, unix_timestamp(now()), ?, ?, ?, ?)',
            [companion.session.userId, params.placeId, params.title, params.description, params.cityId, params.categoryId],
        );

        const sightId = result.insertId;

        if (params.tags.length) {
            const tagIds = await companion.callMethod<number[]>('tags.getIdByTags', { tags: params.tags });
            await setTags(companion, sightId, tagIds);
        }

        return { sightId };
    }
}
