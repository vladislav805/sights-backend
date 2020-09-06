import { IMethodCallProps, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { IUser } from '../../types/user';
import UserFieldsManager from '../../utils/users/user-fields-manager';
import { clamp } from '../../utils/clamp';

type IParams = {
    userId: number;
    fields: UserFieldsManager;
    count: number;
    offset: number;
};

export default class UsersGetFollowers extends OpenMethodAPI<IParams, IApiList<IUser>> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
        const userId = +params.userId;

        if (!userId) {
            throw new Error('Not specified userId');
        }

        return {
            userId,
            fields: new UserFieldsManager(typeof params.fields === 'string' ? params.fields : ''),
            count: clamp(+params.count || 50, 1, 100),
            offset: +params.offset || 0,
        };
    }

    protected async perform({ userId, fields, count, offset }: IParams, { session, database }: IMethodCallProps): Promise<IApiList<IUser>> {
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
