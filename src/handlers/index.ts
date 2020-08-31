import { IApiParams } from '../types/api';
import { IMethodAPI, IMethodProps} from './method';
import * as mysql from 'promise-mysql';
import { ISession } from '../types/session';
import log from '../logger';
import UsersGet from './users/get';
import SessionsGet, { getSessionByAuthKey } from './sessions/get';
import UtilsGetTime from './utils/time';
import SightsGet from './sights/get';
import CitiesGet from './cities/get';
import CitiesGetById from './cities/get-by-id';

let methods: Record<string, IMethodAPI> = {};

export const initMethods = (props: IMethodProps) => {
    const listOfMethods = {
        'users.get': UsersGet,

        'sights.get': SightsGet,

        'cities.get': CitiesGet,
        'cities.getById': CitiesGetById,

        'sessions.get': SessionsGet,

        'utils.getTime': UtilsGetTime,
    };

    const names = Object.keys(listOfMethods);

    for (const name of names) {
        methods[name] = new listOfMethods[name](props);
    }
};

export const hasMethod = (method: string) => method in methods;

export const callMethod = async(method: string, params: IApiParams, db: mysql.Pool) => {
    if (hasMethod(method)) {
        const impl = methods[method];

        let session: ISession | null = null;
        if (impl.needSession() && typeof params.authKey === 'string') {
            session = await getSessionByAuthKey(params.authKey, db);
        }

        const props = {
            session,
        };

        log(`Call ${impl} for ${method} with ${props}`);

        return impl.call(params, props);
    } else {
        throw new Error('Unknown method called');
    }
};
