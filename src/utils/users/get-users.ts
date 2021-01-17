import { IUser } from '../../types/user';
import UserFieldsManager from './user-fields-manager';
import { ICompanion } from '../../handlers/method';

export const getUsers = async(ids: number[], fields: string, companion: ICompanion): Promise<IUser[]> => {
    const uniqueIds = [...new Set(ids)];

    if (!uniqueIds.length) {
        return [];
    }

    const manager = new UserFieldsManager(fields ?? '');
    const { columns, joins } = manager.build(companion.session);

    // noinspection SqlResolve
    const users = await companion.database.select<IUser>(
        `select ${columns} from \`user\` ${joins} where \`user\`.\`userId\` in (?)`,
        [uniqueIds],
    );

    return users.map(manager.handleResult);
};
