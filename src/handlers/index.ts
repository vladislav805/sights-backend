import { IApiParams } from '../types/api';
import { ICompanion, IMethodAPI, PrivateMethodAPI } from './method';
import { ISession } from '../types/session';
import { createConnectionFromPool } from '../database';
import { ApiError, ErrorCode } from '../error';
import { getSessionByAuthKey } from '../session';
import log from '../logger';
import UsersGet from './users/get';
import SessionsGet from './sessions/get';
import UtilsGetTime from './utils/time';
import MapGetSights from './map/get-sights';
import MapGetCities from './map/get-cities';
import CitiesGet from './cities/get';
import CitiesGetById from './cities/get-by-id';
import CitiesSearch from './cities/search';
import CommentsGet from './comments/get';
import CommentsAdd from './comments/add';
import CommentsRemove from './comments/remove';
import CategoriesGet from './categories/get';
import CategoriesGetById from './categories/get-by-id';
import TagsGet from './tags/get';
import TagsGetById from './tags/get-by-id';
import TagsSearch from './tags/search';
import PhotosGet from './photos/get';
import PhotosGetById from './photos/get-by-id';
import PhotosGetUnsorted from './photos/get-unsorted';
import PhotosRemove from './photos/remove';
import PhotosGetUploadUri from './photos/getUploadUri';
import PhotosSuggest from './photos/suggest';
import PhotosApprove from './photos/approve';
import PhotosDecline from './photos/decline';
import UsersSearch from './users/search';
import UsersGetFollowers from './users/get-followers';
import UsersFollow from './users/follow';
import AccountCreate from './account/create';
import AccountSetOnline from './account/set-online';
import AccountAuthorize from './account/authorize';
import AccountActivate from './account/activate';
import AccountSetProfilePhoto from './account/set-profile-photo';
import AccountEdit from './account/edit';
import AccountChangePassword from './account/change-password';
import FeedGet from './feed/get';
import PhotosSave from './photos/save';
import SightsGetById from './sights/get-by-id';
import SightsGet from './sights/get';
import SightsGetRandomSightId from './sights/get-random-sight-id';
import SightsGetCounts from './sights/get-counts';
import SightsGetNearby from './sights/get-nearby';
import SightsAdd from './sights/add';
import SightsSetTags from './sights/set-tags';
import SightsSetMask from './sights/set-mask';
import SightsSetVisitState from './sights/set-visit-state';
import SightsRemove from './sights/remove';
import FieldsGet from './fields/get';
import FieldsGetAll from './fields/get-all';
import FieldsSet from './fields/set';
import SightsGetRecent from './sights/get-recent';
import Execute from './execute';
import SightsGetVisitStat from './sights/get-visit-stat';

export const methods: Map<string, IMethodAPI> = new Map<string, IMethodAPI>();

export const initMethods = () => {
    const listOfMethods = {
        'users.get': UsersGet,
        'users.search': UsersSearch,
        'users.getFollowers': UsersGetFollowers,
        'users.follow': UsersFollow,

        'account.create': AccountCreate,
        'account.authorize': AccountAuthorize,
        'account.activate': AccountActivate,
        'account.edit': AccountEdit,
        'account.changePassword': AccountChangePassword,
        'account.setProfilePhoto': AccountSetProfilePhoto,
        'account.setOnline': AccountSetOnline,

        'map.getSights': MapGetSights,
        'map.getCities': MapGetCities,

        'sights.get': SightsGet,
        'sights.getById': SightsGetById,
        'sights.add': SightsAdd,
        // sights.edit
        'sights.remove': SightsRemove,
        'sights.setTags': SightsSetTags,
        'sights.setVisitState': SightsSetVisitState,
        'sights.setMask': SightsSetMask,
        'sights.getRandomSightId': SightsGetRandomSightId,
        'sights.getNearby': SightsGetNearby,
        'sights.getVisitStat': SightsGetVisitStat,
        'sights.getRecent': SightsGetRecent,
        'sights.getCounts': SightsGetCounts,

        'fields.get': FieldsGet,
        'fields.getAll': FieldsGetAll,
        'fields.set': FieldsSet,

        'cities.get': CitiesGet,
        'cities.getById': CitiesGetById,
        'cities.search' : CitiesSearch,

        'sessions.get': SessionsGet,

        'categories.get': CategoriesGet,
        'categories.getById': CategoriesGetById,

        'tags.get': TagsGet,
        'tags.getById': TagsGetById,
        'tags.search': TagsSearch,

        'feed.get': FeedGet,

        'photos.get': PhotosGet,
        'photos.getById': PhotosGetById,
        'photos.getUnsorted': PhotosGetUnsorted,
        'photos.remove': PhotosRemove,
        'photos.getUploadUri': PhotosGetUploadUri,
        'photos.save': PhotosSave,
        'photos.suggest': PhotosSuggest,
        'photos.approve': PhotosApprove,
        'photos.decline': PhotosDecline,

        'comments.get': CommentsGet,
        'comments.add': CommentsAdd,
        'comments.remove': CommentsRemove,

        'utils.getTime': UtilsGetTime,

        'execute': Execute,
    };

    for (const name of Object.keys(listOfMethods)) {
        methods.set(name, new listOfMethods[name]());
    }
};

export const createCompanion = async(params: IApiParams): Promise<ICompanion> => {
    // Сессия
    let session: ISession | null = null;

    const database = await createConnectionFromPool();

    // Если есть authKey - лезем в БД
    if (typeof params.authKey === 'string') {
        session = await getSessionByAuthKey(params.authKey, database);

        // Если после получения сессии из БД её нет - невалидный authKey
        if (!session) {
            throw new ApiError(ErrorCode.SESSION_INVALID, 'User authorization failed: session is invalid');
        }
    }

    const companion: ICompanion = {
        session,
        callMethod: <T>(method, params): Promise<T> => callMethod<T>(method, params, companion),
        database,
    };

    return companion;
};

export const callMethod = async<T = unknown>(method: string, params: IApiParams = {}, companion: ICompanion): Promise<T> => {
    // Если нет метода - кидаем ошибку
    if (!methods.has(method)) {
        throw new ApiError(ErrorCode.UNKNOWN_METHOD, 'Unknown method called');
    }

    // Экземпляр метода
    const impl = methods.get(method) as IMethodAPI<unknown, T>;

    if (impl instanceof PrivateMethodAPI && !companion.session) { // если метод приватный и нет сессии - ошибка
        throw new ApiError(ErrorCode.AUTH_KEY_NOT_SPECIFIED, 'User authorization failed: authKey not specified');
    }

    log(`Call ${impl} for ${method}`);

    try {
        return impl.call(params, companion);
    } catch (e) {
        console.error('In invoker', e);
        throw e;
    }
};
