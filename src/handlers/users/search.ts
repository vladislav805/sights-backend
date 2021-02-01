import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { IUser } from '../../types/user';
import UserFieldsManager from '../../utils/users/user-fields-manager';
import { clamp } from '../../utils/clamp';
import { toNumber } from '../../utils/to-number';
import { toTheString } from '../../utils/to-string';

type IParams = {
    query: string;
    fields: UserFieldsManager;
    cityId?: number;
    count: number;
    offset: number;
};

export default class UsersSearch extends OpenMethodAPI<IParams, IApiList<IUser>> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const cityId = toNumber(params.cityId, true) ?? undefined;
        return {
            query: toTheString(params.query, true),
            fields: new UserFieldsManager(toTheString(params.fields, true)),
            cityId,
            count: clamp(toNumber(params.count, 50), 1, 100),
            offset: toNumber(params.offset, 0),
        };
    }

    protected async perform({ query, fields, cityId, count, offset }: IParams, { session, database }: ICompanion): Promise<IApiList<IUser>> {
        let where: string[] = [];
        const values: (string | number)[] = [];

        if (query.startsWith('@')) {
            query = query.replace('@', '');
        }

        if (query) {
            where.push('concat(`firstName`, \' \', `lastName`) like ?');
            values.push(`%${query}%`);
        }

        if (cityId) {
            where.push(`\`user\`.\`cityId\` = ${+cityId}`)
        }

        values.push(query);

        const { columns, joins } = fields.build(session);

        const sql = `select ${columns} from \`user\` ${joins} where ${where.length ? where.join(' and ') + ' or' : ''} \`login\` = ? limit ${offset}, ${count}`;

        const items = await database.select<IUser>(
            sql,
            values,
        );

        return {
            count: items.length,
            items: items.map(fields.handleResult),
        };
    }
}
