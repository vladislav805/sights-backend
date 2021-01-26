import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ICollection, ICollectionExtended } from '../../types/collection';
import { toNumber } from '../../utils/to-number';
import { toBoolean } from '../../utils/to-boolean';
import { ApiError, ErrorCode } from '../../error';
import { ISight } from '../../types/sight';
import CollectionFieldsManager from '../../utils/collections/collection-fields-manager';
import SightFieldsManager from '../../utils/sights/sight-fields-manager';
import { hasAccessToCollection } from '../../utils/collections/has-access-to-collection';
import { toTheString } from '../../utils/to-string';

type IParams = {
    collectionId: number;
    onlyInformation: boolean;
    collectionFields: CollectionFieldsManager;
    sightFields: SightFieldsManager;
};

type IResult = ICollection | ICollectionExtended;

export default class CollectionsGetById extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            collectionId: toNumber(params.collectionId, 'collectionId should be integer'),
            onlyInformation: toBoolean(params.onlyInformation),
            collectionFields: new CollectionFieldsManager(toTheString(params.fields, true)),
            sightFields: new SightFieldsManager(toTheString(params.fields, true)),
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IResult> {
        const { columns, joins } = params.collectionFields.build(companion.session);

        const collections = await companion.database.select<ICollectionExtended>(
            'select ' + columns + ' from `collection` ' + joins + ' where `collection`.`collectionId` = ? limit 1',
            [params.collectionId],
        );

        if (!collections.length) {
            throw new ApiError(ErrorCode.COLLECTION_NOT_FOUND);
        }

        const [collection] = collections.map(params.collectionFields.handleResult);

        if (!hasAccessToCollection(collection, companion.session)) {
            throw new ApiError(ErrorCode.ACCESS_DENIED);
        }

        if (!params.onlyInformation) {
            const { columns, joins } = params.sightFields.build(companion.session);

            const sights = await companion.database.select<ISight>(
                'select `pl`.*, ' + columns + ' from `place` `pl` ' + joins + ' left join `sightCollection` on `sightCollection`.`sightId` = `sight`.`sightId` where `sightCollection`.`collectionId` = ? group by `sight`.`sightId` order by `sight`.`sightId` limit 200',
                [collection.collectionId],
            );

            collection.items = sights.map(params.sightFields.handleResult);
        }

        return collection;
    }
}
