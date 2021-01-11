import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { CollectionType, ICollection } from '../../types/collection';
import { toNumber } from '../../utils/to-number';
import { ApiError, ErrorCode } from '../../error';
import { isValidCollectionType } from '../../utils/collections/is-valid-collection-type';
import { toTheString } from '../../utils/to-string';

type IParams = {
    title: string;
    type: CollectionType;
    content: string;
    cityId: number;
};

type IResult = ICollection;

// Одинаковые только проверки внутри handleParams
// noinspection DuplicatedCode
export default class CollectionsAdd extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const title = toTheString(params.title, null, 'title');

        if (title.length < 4) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'title length must be greater than 4 symbols');
        }

        const content = toTheString(params.content, null, 'content');
        const type = params.type;

        if (!isValidCollectionType(type as string)) {
            throw new ApiError(ErrorCode.INVALID_COLLECTION_TYPE, 'Invalid type');
        }

        return {
            title,
            content,
            type: type as CollectionType,
            cityId: toNumber(params.cityId, null),
        };
    }

    protected async perform(params: IParams, companion: ICompanionPrivate): Promise<IResult> {
        const result = await companion.database.apply(
            'insert into `collection` (`ownerId`, `type`, `title`, `content`, `dateCreated`, `cityId`) values (?, ?, ?, ?, unix_timestamp(now()), ?)',
            [
                companion.session.userId,
                params.type,
                params.title,
                params.content,
                params.cityId,
            ],
        );

        const collectionId = result.insertId;

        return companion.callMethod('collections.getById', {
            collectionId,
            onlyInformation: true,
        });
    }
}
