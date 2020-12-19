import config from '../../config';
import { stringify } from 'querystring';
import { IApiParams } from '../../types/api';

export const remoteCommand = (path: string, params: IApiParams) => fetch(`http://localhost:${config.PORT_MEDIA}/${path}?${stringify(params)}`).then(res => res.text());
