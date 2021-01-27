import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ICollection } from '../../types/collection';
import { toNumber } from '../../utils/to-number';
import CollectionFieldsManager from '../../utils/collections/collection-fields-manager';
import { toTheString } from '../../utils/to-string';

type IParams = {
    ownerId: number;
    count: number; // = 50
    offset: number; // = 0
    fields: CollectionFieldsManager;
};

type IResult = IApiList<ICollection>;

export default class CollectionsGet extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, companion: ICompanion): IParams {
        return {
            ownerId: toNumber(params.ownerId, companion.session?.userId),
            count: toNumber(params.count, 50),
            offset: toNumber(params.offset, 0),
            fields: new CollectionFieldsManager(toTheString(params.fields, true)),
        };
    }

    protected async perform(params: IParams, { database, session }: ICompanion): Promise<IResult> {
        const where: string[] = [
            '`ownerId` = ?',
        ];

        if (session && params.ownerId === session.userId) {
            where.push(' and `type` in (\'PUBLIC\', \'PRIVATE\', \'DRAFT\')');
        } else {
            where.push(' and `type` = \'PUBLIC\'');
        }

        const whereStr = where.join(' ');

        const count = await database.count(
            'select count(*) as `count` from `collection` where ' + whereStr,
            [params.ownerId],
        );

        const { joins, columns } = params.fields.build(session);

        const items = await database.select<ICollection>(
            `select ${columns} from \`collection\` ${joins} where ${whereStr} order by \`collectionId\` desc limit ?, ?`,
            [params.ownerId, params.offset, params.count],
        );

        return {
            count,
            items: items.map(params.fields.handleResult),
        };
    }
}
