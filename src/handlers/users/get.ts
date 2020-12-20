import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IUser } from '../../types/user';
import { ApiParam } from '../../types/api';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import db from '../../database';
import UserFieldsManager from '../../utils/users/user-fields-manager';

type UsersGetParams = {
    userIds: (number | string)[];
    fields: UserFieldsManager;
};

class UsersGet extends OpenMethodAPI<UsersGetParams, IUser[]> {
    protected handleParams(params: Record<keyof UsersGetParams, ApiParam>, props: ICallPropsOpen): UsersGetParams {
        let userIds: string[] = paramToArrayOf(params.userIds as string);

        if (!userIds.length) {
            if (props.session) {
                userIds.push(props.session.user!.login);
            }
        }

        // TODO из массива в строку, внутри manager'ов из строки в массив, нелогично!
        if (Array.isArray(params.fields)) {
            params.fields = params.fields.join(',');
        }

        return {
            userIds,
            fields: new UserFieldsManager(typeof params.fields === 'string' ? params.fields : ''),
        };
    }

    protected async perform({ userIds, fields }: UsersGetParams, { session, database }: ICallPropsOpen): Promise<IUser[]> {
        if (userIds.length === 0) {
            return [];
        }

        const _db = await db();

        const ids = userIds
            .filter(item => !isNaN(+item))
            .join(',');

        const logins = userIds
            .filter(item => isNaN(+item))
            .map(value => _db.escape(value))
            .join(',');

        const { joins, columns } = fields.build(session);

        const where = [
            ids.length && `\`userId\` in (${ids})`,
            logins.length && `\`login\` in (${logins})`,
        ].filter(Boolean).join(' or ');

        const users = await database.select<IUser>(
            `select ${columns} from \`user\` ${joins} where ${where}`,
            [],
        );

        return users.map(fields.handleResult);
    }
}

export default UsersGet;
