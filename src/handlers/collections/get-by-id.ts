import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ICollection, ICollectionExtended } from '../../types/collection';
import { toNumber } from '../../utils/to-number';
import { toBoolean } from '../../utils/to-boolean';
import { ApiError, ErrorCode } from '../../error';
import { ISight } from '../../types/sight';
import SightFieldsManager from '../../utils/sights/sight-fields-manager';

type IParams = {
    collectionId: number;
    onlyInformation: boolean;
    fields: SightFieldsManager;
};

type IResult = ICollection | ICollectionExtended;

export default class CollectionsGetById extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            collectionId: toNumber(params.collectionId, 'collectionId should be integer'),
            onlyInformation: toBoolean(params.onlyInformation),
            fields: new SightFieldsManager(params.fields as string),
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IResult> {
        const collections = await companion.database.select<ICollectionExtended>(
            'select * from `collection` where `collectionId` = ? limit 1',
            [params.collectionId],
        );

        if (!collections.length) {
            throw new ApiError(ErrorCode.COLLECTION_NOT_FOUND);
        }

        const [collection] = collections;

        if (!params.onlyInformation) {
            const { columns, joins } = params.fields.build(companion.session);

            const sights = await companion.database.select<ISight>(
                'select `pl`.*, ' + columns + ' from `place` `pl` ' + joins + ' left join `sightCollection` on `sightCollection`.`sightId` = `sight`.`sightId` where `sightCollection`.`collectionId` = ? group by `sight`.`sightId` order by `sight`.`sightId` limit 200',
                [collection.collectionId],
            );

            collection.items = sights.map(params.fields.handleResult);
        }

        return collection;
    }
}