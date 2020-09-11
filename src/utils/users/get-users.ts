import { IUser } from '../../types/user';
import { select } from '../../database';
import UserFieldsManager from './user-fields-manager';
import { ISession } from '../../types/session';

export const getUsers = async(ids: number[], fields: string, session: ISession | null): Promise<IUser[]> => {
    const uniqueIds = [...new Set(ids)];
    const manager = new UserFieldsManager(fields);
    const { columns, joins } = manager.build(session);

    // noinspection SqlResolve
    const users = await select<IUser>(
        `select ${columns} from \`user\` ${joins} where \`user\`.\`userId\` in (?)`,
        [uniqueIds],
    );

    return users.map(manager.handleResult);
};
