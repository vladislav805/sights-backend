import { ICompanion, OpenMethodAPI } from '../method';
import { IUser } from '../../types/user';
import { ApiParam } from '../../types/api';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import UserFieldsManager from '../../utils/users/user-fields-manager';
import { toTheString } from '../../utils/to-string';

type UsersGetParams = {
    userIds: (number | string)[];
    fields: UserFieldsManager;
};

class UsersGet extends OpenMethodAPI<UsersGetParams, IUser[]> {
    protected handleParams(params: Record<keyof UsersGetParams, ApiParam>, props: ICompanion): UsersGetParams {
        let userIds = paramToArrayOf(params.userIds);

        if (!userIds.length) {
            if (props.session) {
                userIds.push(String(props.session.userId));
            }
        }

        // TODO из массива в строку, внутри manager'ов из строки в массив, нелогично!
        if (Array.isArray(params.fields)) {
            params.fields = params.fields.join(',');
        }

        return {
            userIds,
            fields: new UserFieldsManager(toTheString(params.fields)),
        };
    }

    protected async perform({ userIds, fields }: UsersGetParams, { session, database }: ICompanion): Promise<IUser[]> {
        if (userIds.length === 0) {
            return [];
        }

        const ids = userIds
            .filter(item => !isNaN(+item))
            .join(',');

        const logins = userIds
            .filter(item => isNaN(+item))
            .map(value => database.escape(String(value)))
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
