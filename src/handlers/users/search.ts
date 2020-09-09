import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { IUser } from '../../types/user';
import UserFieldsManager from '../../utils/users/user-fields-manager';
import { clamp } from '../../utils/clamp';

type IParams = {
    query: string;
    fields: UserFieldsManager;
    cityId?: number;
    count: number;
    offset: number;
};

export default class UsersSearch extends OpenMethodAPI<IParams, IApiList<IUser>> {
    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParams {
        const cityId = +params.cityId || undefined;
        return {
            query: String(params.query || ''),
            fields: new UserFieldsManager(typeof params.fields === 'string' ? params.fields : ''),
            cityId,
            count: clamp(+params.count || 50, 1, 100),
            offset: +params.offset || 0,
        };
    }

    protected async perform({ query, fields, cityId, count, offset }: IParams, { session, database }: ICallPropsOpen): Promise<IApiList<IUser>> {
        let where: string[] = [];

        if (query.startsWith('@')) {
            query = query.replace('@', '');
        }

        where.push('concat(`firstName`, \' \', `lastName`) like ?');

        if (cityId) {
            where.push(`\`cityId\` = ${+cityId}`)
        }

        const { columns, joins } = fields.build(session);

        const sql = `select ${columns} from \`user\` ${joins} where ${where.join(' and ')} or \`login\` = ? limit ${offset}, ${count}`;

        const items = await database.select<IUser>(
            sql,
            [`%${query}%`, query],
        );

        return {
            count: items.length,
            items: items.map(fields.handleResult),
        };
    }
}
