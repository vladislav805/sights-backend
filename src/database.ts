import * as mysql from 'promise-mysql';
import { getConfigValue } from './config';

let database: mysql.Pool;

type IDatabaseSelect = <T>(sql: string, values?: unknown[], connect?: mysql.Connection | mysql.Pool | mysql.PoolConnection) => Promise<T[]>;
type IDatabaseApply = (sql: string, values?: unknown[], connect?: mysql.Connection | mysql.Pool | mysql.PoolConnection) => Promise<IDatabaseApplyQuery>;
export type IDatabaseBundle = {
    select: IDatabaseSelect;
    apply: IDatabaseApply;
    destroy: () => Promise<void>;
};

type IDatabaseApplyQuery = {
    insertId: number;
    affectedRows: number;
    threadId: number;
};

export const connect = async() => {
    if (database) {
        return database;
    }

    database = await mysql.createPool({
        host: getConfigValue<string>('DATABASE_HOST'),
        user: getConfigValue<string>('DATABASE_USER'),
        password: getConfigValue<string>('DATABASE_PASSWORD'),
        database: getConfigValue<string>('DATABASE_NAME'),
    })

    return database;
};

export const select: IDatabaseSelect = (sql, values, connect = database) => connect.query({ sql, values });
export const apply: IDatabaseApply = (sql, values, connect = database) => connect.query({ sql, values });

export const getSelectAndApplyFromPool = (): Promise<IDatabaseBundle> => database.getConnection().then(connection => ({
    select: (sql, values) => select(sql, values, connection),
    apply: (sql, values) => apply(sql, values, connection),
    destroy: () => connection.destroy(),
}));

export default connect;
