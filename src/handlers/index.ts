import { IApiParams } from '../types/api';
import { IMethodAPI, IMethodCallProps, IMethodProps, PrivateMethodAPI } from './method';
import * as mysql from 'promise-mysql';
import { ISession } from '../types/session';
import log from '../logger';
import UsersGet from './users/get';
import SessionsGet, { getSessionByAuthKey } from './sessions/get';
import UtilsGetTime from './utils/time';
import SightsGet from './sights/get';
import CitiesGet from './cities/get';
import CitiesGetById from './cities/get-by-id';
import CommentsGet from './comments/get';
import CommentsAdd from './comments/add';

let methods: Record<string, IMethodAPI> = {};

export const initMethods = (props: IMethodProps) => {
    const listOfMethods = {
        'users.get': UsersGet,

        'sights.get': SightsGet,

        'cities.get': CitiesGet,
        'cities.getById': CitiesGetById,

        'sessions.get': SessionsGet,

        'comments.get': CommentsGet,
        'comments.add': CommentsAdd,

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
        if (impl.needSession() && impl instanceof PrivateMethodAPI) {
            if (typeof params.authKey === 'string') {
                session = await getSessionByAuthKey(params.authKey, db);
            } else {
                throw new Error('User authorization failed: authKey not specified');
            }

            if (!session) {
                throw new Error('User authorization failed: session is invalid');
            }
        }

        const props: IMethodCallProps = {
            session,
            callMethod: (method: string, params: IApiParams) => callMethod(method, params, db),
        };

        log(`Call ${impl} for ${method} with ${props}`);

        return impl.call(params, props);
    } else {
        throw new Error('Unknown method called');
    }
};
