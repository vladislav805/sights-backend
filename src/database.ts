import * as mysql from 'promise-mysql';
import config from './config';
import log from './logger';

let database: mysql.Pool | undefined;

export type IDatabaseBundle = {
    select<T>(sql: string, values?: unknown[]): Promise<T[]>;
    apply(sql: string, values?: unknown[]): Promise<IDatabaseApplyQuery>;
    count(sql: string, values?: unknown[]): Promise<number>;
    destroy(): Promise<void>;
    escape(string: string): string;
};

export type IDatabaseApplyQuery = {
    insertId: number;
    affectedRows: number;
    threadId: number;
};

export const connect = async(): Promise<mysql.Pool> => {
    if (database) {
        log('Used exists database pool');
        return database;
    }

    database = await mysql.createPool(config.db);
    log('Created database pool');

    database.on('error', () => {
        database = undefined;
        log('Database pool error occurred');
        connect();
    });

    return database;
};

export const createConnectionFromPool = (): Promise<IDatabaseBundle> => connect()
    .then(conn => conn.getConnection())
    .then(connection => ({
        select: (sql, values) => connection.query({ sql, values }),
        apply: (sql, values) => connection.query(sql, values),
        count: (sql, values) => connection.query({ sql, values })
            .then(res => res?.[0]?.count),
        destroy: async() => connection.destroy(),
        escape: (string: string) => database?.escape(string) ?? '',
    }));

export default connect;
