import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ICollection } from '../../types/collection';
import { toNumber } from '../../utils/to-number';
import { toTheString } from '../../utils/to-string';
import CollectionFieldsManager from '../../utils/collections/collection-fields-manager';

type IParams = {
    query: string;
    cityId: number;
    count: number; // = 50
    offset: number; // = 0
    fields: CollectionFieldsManager;
};

type IResult = IApiList<ICollection>;

export default class CollectionsSearch extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            query: toTheString(params.query, null, 'query'),
            cityId: toNumber(params.cityId, 0),
            count: toNumber(params.count, 50),
            offset: toNumber(params.offset, 0),
            fields: new CollectionFieldsManager(toTheString(params.fields, true)),
        };
    }

    protected async perform(params: IParams, { database, session }: ICompanion): Promise<IResult> {
        const where = [
            '`collection`.`title` like ?',
            '`collection`.`type` = \'PUBLIC\'',
        ];
        const values: (string | number)[] = [
            `%${params.query}%`,
        ];

        if (params.cityId) {
            where.push('`collection`.`cityId` = ?');
            values.push(params.cityId);
        }

        const whereStr = where.join(' and ');

        const count = await database.count(
            'select count(*) as `count` from `collection` where ' + whereStr,
            values,
        );

        const { columns, joins } = params.fields.build(session);

        const items = await database.select<ICollection>(
            'select ' + columns + ' from `collection` ' + joins + ' where ' + whereStr + ' limit ?, ?',
            [...values, params.offset, params.count],
        );

        return {
            count,
            items: items.map(params.fields.handleResult),
        };
    }
}
