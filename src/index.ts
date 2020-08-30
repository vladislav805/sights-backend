import * as restana from 'restana';
import * as connectQuery from 'connect-query';
import * as bodyParser from 'body-parser';
import * as mysql from 'promise-mysql';
import { callMethod, initMethods } from './handlers';
import { getConfigValue, loadConfig } from './config';
import { IApiParams } from './types/api';

let db: mysql.Connection;

const service = restana();

service.use(connectQuery());
service.use(bodyParser.json());
service.use(bodyParser.urlencoded({ extended: true }));

service.all('/api/:method', async(request, response) => {
    const { params, query, body } = request;
    const { method } = params;

    let apiParams = {
        ...query,
        ...(body as IApiParams),
    };

    try {
        response.send({
            result: await callMethod(method, apiParams, db),
        });
    } catch (e) {
        response.send({ error: (e as Error).message });
    }
});

loadConfig();


async function connect2db(): Promise<mysql.Connection> {
    if (db) {
        return db;
    }

    db = await mysql.createConnection({
        host: getConfigValue<string>('DATABASE_HOST'),
        user: getConfigValue<string>('DATABASE_USER'),
        password: getConfigValue<string>('DATABASE_PASSWORD'),
        database: getConfigValue<string>('DATABASE_NAME'),
    })

    return db;
}

service.start(+getConfigValue<number>('PORT')).then(async server => {
    db = await connect2db();

    initMethods({
        getDatabase: connect2db,
    });

    process.stdout.write('Server started\n');
});
