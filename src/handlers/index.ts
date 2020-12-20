import { IApiParams } from '../types/api';
import { ICallPropsOpen, IMethodAPI, PrivateMethodAPI } from './method';
import { ISession } from '../types/session';
import log from '../logger';
import UsersGet from './users/get';
import SessionsGet, { getSessionByAuthKey } from './sessions/get';
import UtilsGetTime from './utils/time';
import MapGetSights from './map/get-sights';
import MapGetCities from './map/get-cities';
import CitiesGet from './cities/get';
import CitiesGetById from './cities/get-by-id';
import CommentsGet from './comments/get';
import CommentsAdd from './comments/add';
import CommentsRemove from './comments/remove';
import { getSelectAndApplyFromPool } from '../database';
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
import UsersSubscribe from './users/subscribe';
import { ApiError, ErrorCode } from '../error';
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

let methods: Record<string, IMethodAPI> = {};

export const initMethods = () => {
    const listOfMethods = {
        'users.get': UsersGet,
        'users.search': UsersSearch,
        'users.getFollowers': UsersGetFollowers,
        'users.follow': UsersSubscribe,

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
        'sights.remove': SightsRemove,
        'sights.setTags': SightsSetTags,
        'sights.setVisitState': SightsSetVisitState,
        'sights.setMask': SightsSetMask,
        'sights.getRandomSightId': SightsGetRandomSightId,
        'sights.getNearby': SightsGetNearby,
        'sights.getCounts': SightsGetCounts,

        'fields.get': FieldsGet,
        'fields.getAll': FieldsGetAll,
        'fields.set': FieldsSet,

        'cities.get': CitiesGet,
        'cities.getById': CitiesGetById,

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
    };

    const names = Object.keys(listOfMethods);

    for (const name of names) {
        methods[name] = new listOfMethods[name]();
    }
};


export const callMethod = async<T = unknown>(method: string, params: IApiParams): Promise<T> => {
    // Если нет метода - кидаем ошибку
    if (!(method in methods)) {
        throw new ApiError(ErrorCode.UNKNOWN_METHOD, 'Unknown method called');
    }

    // Инстанс метода
    const impl = methods[method] as IMethodAPI<unknown, T>;

    // Сессия
    let session: ISession | null = null;

    // Если есть authKey - лезем в БД
    if (typeof params.authKey === 'string') {
        session = await getSessionByAuthKey(params.authKey);

        // Если после получения сессии из БД её нет - невалидный authKey
        if (!session) {
            throw new ApiError(ErrorCode.SESSION_INVALID, 'User authorization failed: session is invalid');
        }
    } else if (impl instanceof PrivateMethodAPI) { // если нет ключа и метод приватный - ошибка
        throw new ApiError(ErrorCode.AUTH_KEY_NOT_SPECIFIED, 'User authorization failed: authKey not specified');
    }

    // Пропсы для выполнения метода
    const props: ICallPropsOpen = {
        session,
        callMethod,
        database: await getSelectAndApplyFromPool(),
    };

    log(`Call ${impl} for ${method}`);

    try {
        const result = await impl.call(params, props);

        // noinspection ES6MissingAwait
        void props.database.destroy();

        return result;
    } catch (e) {
        console.error('In invoker', e);
        throw e;
    }
};
