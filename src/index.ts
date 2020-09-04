import { getConfigValue, loadConfig } from './config';
loadConfig();

import * as restana from 'restana';
import * as connectQuery from 'connect-query';
import * as bodyParser from 'body-parser';
import { callMethod, initMethods } from './handlers';
import { IApiParams } from './types/api';
import log from './logger';
import connect from './database';
import multer = require('multer');
import config from './uploader/config';
import handleUpload from './uploader';
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

service.get('/ps/upload', (req, res) => {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.send('<form method="post" enctype="multipart/form-data">'
        + '<p>Image: <input type="file" name="file" /></p>'
        + '<p><input type="submit" value="Upload" /></p>'
        + '</form>');
});

const upload = multer({ dest: config.directory.temp });
service.post('/ps/upload', upload.single('file'), handleUpload);

service.start(+getConfigValue<number>('PORT'))
    .then(connect)
    .then(initMethods)
    .then(() => process.stdout.write('Server started\n'));
