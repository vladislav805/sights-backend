import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { IUser } from '../../types/user';
import UserFieldsManager from '../../utils/users/user-fields-manager';
import { clamp } from '../../utils/clamp';
import { toNumber } from '../../utils/to-number';
import { toTheString } from '../../utils/to-string';

type IParams = {
    userId: number;
    fields: UserFieldsManager;
    count: number;
    offset: number;
};

export default class UsersGetFollowers extends OpenMethodAPI<IParams, IApiList<IUser>> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const userId = toNumber(params.userId, 'userId');

        return {
            userId,
            fields: new UserFieldsManager(toTheString(params.fields, true)),
            count: clamp(toNumber(params.count, 50), 1, 100),
            offset: toNumber(params.offset, 0),
        };
    }

    protected async perform({ userId, fields, count, offset }: IParams, { session, database }: ICompanion): Promise<IApiList<IUser>> {
        const { columns, joins } = fields.build(session);

        const allCount = await database.count(
            'select count(*) as `count` from `subscribe` where `targetId` = ?',
            [userId],
        );

        const items = await database.select<IUser>(
            `select ${columns} from \`subscribe\` left join \`user\` on \`user\`.\`userId\` = \`subscribe\`.\`userId\` ${joins} where \`subscribe\`.\`targetId\` = ? limit ${offset}, ${count}`,
            [userId],
        );

        return {
            count: allCount,
            items: items.map(fields.handleResult),
        };
    }
}
