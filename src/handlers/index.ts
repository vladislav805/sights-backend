import type { IApiParams } from '../types/api';
import type { ICompanion, IMethodAPI } from './method';
import { PrivateMethodAPI, TrustedMethodAPI } from './method';
import type { ISession } from '../types/session';
import { createConnectionFromPool } from '../database';
import { ApiError, ErrorCode } from '../error';
import { getSessionByAuthKey, getSessionByTelegramId } from '../session';
import log from '../logger';
import UsersGet from './users/get';
import UsersSearch from './users/search';
import UsersFollow from './users/follow';
import UsersGetRanks from './users/get-ranks';
import UsersGetFollowers from './users/get-followers';
import UsersGetAchievements from './users/get-achievements';
import SessionsGet from './sessions/get';
import MapAddPlace from './map/add-place';
import MapGetSights from './map/get-sights';
import MapGetCities from './map/get-cities';
import MapGetPlaces from './map/get-places';
import CitiesGet from './cities/get';
import CitiesGetById from './cities/get-by-id';
import CitiesSearch from './cities/search';
import CommentsGet from './comments/get';
import CommentsAdd from './comments/add';
import CommentsRemove from './comments/remove';
import CommentsReport from './comments/report';
import CategoriesGet from './categories/get';
import CategoriesGetById from './categories/get-by-id';
import TagsGet from './tags/get';
import TagsSearch from './tags/search';
import TagsGetById from './tags/get-by-id';
import TagsGetIdByTags from './tags/get-id-by-tags';
import PhotosGet from './photos/get';
import PhotosSave from './photos/save';
import PhotosRemove from './photos/remove';
import PhotosGetById from './photos/get-by-id';
import PhotosSuggest from './photos/suggest';
import PhotosApprove from './photos/approve';
import PhotosDecline from './photos/decline';
import PhotosGetRandom from './photos/get-random';
import PhotosGetUnsorted from './photos/get-unsorted';
import PhotosGetUploadUri from './photos/getUploadUri';
import AccountEdit from './account/edit';
import AccountCreate from './account/create';
import AccountLogout from './account/logout';
import AccountActivate from './account/activate';
import AccountSetOnline from './account/set-online';
import AccountAuthorize from './account/authorize';
import AccountChangePassword from './account/change-password';
import AccountSetProfilePhoto from './account/set-profile-photo';
import AccountSetSocialConnection from './account/set-social-connection';
import AccountGetSocialConnections from './account/get-social-connections';
import FeedGet from './feed/get';
import FeedGetSourceList from './feed/get-source-list';
import SightsGet from './sights/get';
import SightsAdd from './sights/add';
import SightsEdit from './sights/edit';
import SightsRemove from './sights/remove';
import SightsReport from './sights/report';
import SightsSearch from './sights/search';
import SightsGetById from './sights/get-by-id';
import SightsSetTags from './sights/set-tags';
import SightsSetMask from './sights/set-mask';
import SightsGetRecent from './sights/get-recent';
import SightsSetPhotos from './sights/set-photos';
import SightsGetNearby from './sights/get-nearby';
import SightsGetCounts from './sights/get-counts';
import SightsGetVisitStat from './sights/get-visit-stat';
import SightsSetVisitState from './sights/set-visit-state';
import SightsGetRandomSightId from './sights/get-random-sight-id';
import FieldsGet from './fields/get';
import FieldsSet from './fields/set';
import FieldsGetAll from './fields/get-all';
import RatingSet from './rating/set';
import CollectionsGet from './collections/get';
import CollectionsAdd from './collections/add';
import CollectionsEdit from './collections/edit';
import CollectionsSearch from './collections/search';
import CollectionsRemove from './collections/remove';
import CollectionsGetById from './collections/get-by-id';
import CollectionsGetBySight from './collections/get-by-sight';
import CollectionsIsAffiliate from './collections/is-affiliate';
import CollectionsSetAffiliation from './collections/set-affiliation';
import Execute from './execute';
import InternalGetPage from './internal/get-page';
import InternalParseMarkdown from './internal/parse-markdown';
import UtilsGetTime from './utils/time';
import UtilsRebuildPoints from './utils/rebuild-points';
import OsmRoute from './osm/route';
import OsmSearch from './osm/search';
import OsmGetAddress from './osm/get-address';
import config from '../config';

export const methods = new Map<string, IMethodAPI>();

export const initMethods = () => {
    const listOfMethods = {
        'users.get': UsersGet,
        'users.search': UsersSearch,
        'users.getFollowers': UsersGetFollowers,
        'users.follow': UsersFollow,
        'users.getAchievements': UsersGetAchievements,
        'users.getRanks': UsersGetRanks,

        'account.create': AccountCreate,
        'account.authorize': AccountAuthorize,
        'account.activate': AccountActivate,
        'account.edit': AccountEdit,
        'account.changePassword': AccountChangePassword,
        'account.setProfilePhoto': AccountSetProfilePhoto,
        'account.setOnline': AccountSetOnline,
        'account.getSocialConnections': AccountGetSocialConnections,
        'account.setSocialConnection': AccountSetSocialConnection,
        'account.logout': AccountLogout,

        'map.getSights': MapGetSights,
        'map.getCities': MapGetCities,
        'map.getPlaces': MapGetPlaces,
        'map.addPlace': MapAddPlace,

        'sights.get': SightsGet,
        'sights.getById': SightsGetById,
        'sights.add': SightsAdd,
        'sights.edit': SightsEdit,
        'sights.remove': SightsRemove,
        'sights.setTags': SightsSetTags,
        'sights.setPhotos': SightsSetPhotos,
        'sights.setVisitState': SightsSetVisitState,
        'sights.setMask': SightsSetMask,
        'sights.getRandomSightId': SightsGetRandomSightId,
        'sights.getNearby': SightsGetNearby,
        'sights.getVisitStat': SightsGetVisitStat,
        'sights.getRecent': SightsGetRecent,
        'sights.getCounts': SightsGetCounts,
        'sights.report': SightsReport,
        'sights.search': SightsSearch,

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
        'tags.getIdByTags': TagsGetIdByTags,

        'feed.get': FeedGet,
        'feed.getSourceList': FeedGetSourceList,

        'photos.get': PhotosGet,
        'photos.getById': PhotosGetById,
        'photos.getUnsorted': PhotosGetUnsorted,
        'photos.remove': PhotosRemove,
        'photos.getUploadUri': PhotosGetUploadUri,
        'photos.save': PhotosSave,
        'photos.suggest': PhotosSuggest,
        'photos.approve': PhotosApprove,
        'photos.decline': PhotosDecline,
        'photos.getRandom': PhotosGetRandom,

        'comments.get': CommentsGet,
        'comments.add': CommentsAdd,
        'comments.remove': CommentsRemove,
        'comments.report': CommentsReport,

        'rating.set': RatingSet,

        'collections.get': CollectionsGet,
        'collections.add': CollectionsAdd,
        'collections.edit': CollectionsEdit,
        'collections.getById': CollectionsGetById,
        'collections.search': CollectionsSearch,
        'collections.remove': CollectionsRemove,
        'collections.getBySight': CollectionsGetBySight,
        'collections.isAffiliate': CollectionsIsAffiliate,
        'collections.setAffiliation': CollectionsSetAffiliation,

        'utils.getTime': UtilsGetTime,
        'utils.rebuildPoints': UtilsRebuildPoints,

        'osm.getAddressByCoordinate': OsmGetAddress,
        'osm.search': OsmSearch,
        'osm.route': OsmRoute,

        'execute': Execute,

        'internal.getPage': InternalGetPage,
        'internal.parseMarkdownForObjects': InternalParseMarkdown,
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
    } else if (typeof params.__telegramId !== 'undefined') {
        const user = await getSessionByTelegramId(+params.__telegramId, database);

        session = {
            userId: user?.userId ?? 0,
            authKey: '',
            date: 0,
            authId: 0,
            user,
        };
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
    const impl = methods.get(method) as IMethodAPI<IApiParams, T>;

    if (impl instanceof TrustedMethodAPI) {
        if (params.__trustKey !== config.secret.TRUST_KEY) {
            throw new ApiError(ErrorCode.UNKNOWN_METHOD, 'Unknown method called');
        }
    } else if (impl instanceof PrivateMethodAPI && !companion.session) { // если метод приватный и нет сессии - ошибка
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
