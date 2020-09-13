import { ICallPropsPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { ApiError, ErrorCode } from '../../error';
import setTags from '../../utils/sights/set-tags';

type IParams = {
    placeId: number;
    title: string;
    description: string;
    cityId: number | null;
    categoryId: number | null;
    tagIds: number[];
};

type IResult = {
    sightId: number;
};

export default class SightsAdd extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICallPropsPrivate): IParams {
        const placeId = toNumber(params.placeId, -1);
        if (!placeId || placeId < 0) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter placeId is invalid');
        }

        if (!params.title || typeof params.title !== 'string' || params.title.trim().length < 2) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter title not specified or invalid');
        }

        return {
            placeId: toNumber(params.placeId),
            title: params.title.trim(),
            description: params.description as string ?? '',
            cityId: toNumber(params.cityId, true),
            categoryId: toNumber(params.categoryId, true),
            tagIds: paramToArrayOf(params.tagIds as string, Number),
        };
    }

    protected async perform(params: IParams, props: ICallPropsPrivate): Promise<IResult> {
        const result = await props.database.apply(
            'insert into `sight` (`ownerId`, `placeId`, `dateCreated`, `title`, `description`, `cityId`, `categoryId`) values (?, ?, unix_timestamp(now()), ?, ?, ?, ?)',
            [props.session.userId, params.placeId, params.title, params.description, params.cityId, params.categoryId],
        );

        const sightId = result.insertId;

        if (params.tagIds.length) {
            await setTags(props.database, sightId, params.tagIds);
        }

        return { sightId };
    }
}
