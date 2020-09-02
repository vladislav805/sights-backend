import { IApiParams } from '../types/api';
import { IMethodAPI, IMethodCallProps, PrivateMethodAPI } from './method';
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
import CommentsRemove from './comments/remove';
import { getSelectAndApplyFromPool } from '../database';
import CategoriesGet from './categories/get';
import CategoriesGetById from './categories/get-by-id';

export interface IInitMethodProps {
    database: mysql.Pool;
}

let methods: Record<string, IMethodAPI> = {};

export const initMethods = () => {
    const listOfMethods = {
        'users.get': UsersGet,

        'sights.get': SightsGet,

        'cities.get': CitiesGet,
        'cities.getById': CitiesGetById,

        'sessions.get': SessionsGet,

        'categories.get': CategoriesGet,
        'categories.getById': CategoriesGetById,

        'comments.get': CommentsGet,
        'comments.add': CommentsAdd,
        'comments.remove': CommentsRemove,

        'utils.getTime': UtilsGetTime,
    };

    const names = Object.keys(listOfMethods);

    for (const name of names) {
        methods[name] = new listOfMethods[name]();
    }
};


export const callMethod = async(method: string, params: IApiParams) => {
    // Если нет метода - кидаем ошибку
    if (!(method in methods)) {
        throw new Error('Unknown method called');
    }

    // Инстанс метода
    const impl = methods[method];

    // Сессия
    let session: ISession | null = null;

    // Если есть authKey - лезем в БД
    if (typeof params.authKey === 'string') {
        session = await getSessionByAuthKey(params.authKey);

        // Если после получения сессии из БД её нет - невалидный authKey
        if (!session) {
            throw new Error('User authorization failed: session is invalid');
        }
    } else if (impl instanceof PrivateMethodAPI) { // если нет ключа и метод приватный - ошибка
        throw new Error('User authorization failed: authKey not specified');
    }

    // Пропсы для выполнения метода
    const props: IMethodCallProps = {
        session,
        callMethod,
        database: await getSelectAndApplyFromPool(),
    };

    log(`Call ${impl} for ${method}`);

    try {
        return impl
            .call(params, props)
            .then(res => {
                void props.database.destroy();
                return res;
            })
            .catch(e => console.error(e));
    } catch (e) {
        console.error(e);
    }
};
