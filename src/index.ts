import * as restana from 'restana';
import * as connectQuery from 'connect-query';
import * as bodyParser from 'body-parser';
import config from './config';
import log from './logger';
import { callMethod, createCompanion, initMethods } from './handlers';
import { IApiParams } from './types/api';
import { ApiError, ErrorCode } from './error';
import { IApiError } from './types/base';
import renderSitemap from './seo/sitemap';

const service = restana();

service.use(connectQuery());
service.use(bodyParser.json());

service.get('/sitemap.xml', async(req, res) => {
    res.setHeader('Content-type', 'application/xml; charset=utf-8');

    res.end(await renderSitemap());
});

service.options('/api/:method', async(req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.send();
});

const methodHandler = async(request, response) => {
    const { params, query, body } = request;
    const { method } = params;

    let apiParams = {
        ...query,
        ...(body as IApiParams),
    };

    log(`Request to ${method} with ${apiParams}`);

    const companion = await createCompanion(apiParams);
    try {
        response.setHeader('access-control-allow-origin', '*');

        const result = await callMethod(method, apiParams, companion);

        response.send({ result });
    } catch (e) {
        response.send({
            error: {
                code: e instanceof ApiError ? e.code : ErrorCode.UNKNOWN,
                message: e instanceof ApiError ? e.toString() : e.message,
            } as IApiError,
        });
    }
    companion.database?.destroy?.();
};

service.get('/api/:method', methodHandler);
service.post('/api/:method', methodHandler);

service.start(config.PORT_MAIN)
    .then(initMethods)
    .then(() => process.stdout.write(`Main server started on port ${config.PORT_MAIN}\n`));
