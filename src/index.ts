import * as restana from 'restana';
import * as connectQuery from 'connect-query';
import * as bodyParser from 'body-parser';
import config from './config';
import log from './logger';
import connect from './database';
import { callMethod, initMethods } from './handlers';
import { IApiParams } from './types/api';
import { ApiError, ErrorCode } from './error';

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

    log(`Request to ${method} with ${apiParams}`);

    try {
        response.setHeader('access-control-allow-origin', '*');
        response.send({
            result: await callMethod(method, apiParams),
        });
    } catch (e) {
        response.send({
            error: {
                code: e instanceof ApiError ? e.code : ErrorCode.UNKNOWN,
                message: e instanceof ApiError ? e.toString() : e.message,
            },
        });
    }
});

service.start(config.PORT_MAIN)
    .then(connect)
    .then(initMethods)
    .then(() => process.stdout.write(`Main server started on port ${config.PORT_MAIN}\n`));
