import { IUser } from '../../types/user';

export const USER_KEYS: (keyof IUser)[] = [
    'userId',
    'firstName',
    'lastName',
    'sex',
    'login',
    'status',
    'bio',
    'lastSeen',
];

export const USERS_GET_FIELD_PHOTO = 'photo';
export const USERS_GET_FIELD_CITY = 'city';
export const USERS_GET_FIELD_FOLLOWERS = 'followers';
export const USERS_GET_FIELD_IS_FOLLOWING = 'isFollowing';
export const USERS_GET_FIELD_IS_ONLINE = 'isOnline';

export const USERS_GET_FIELDS_ALLOWED = [
    USERS_GET_FIELD_PHOTO,
    USERS_GET_FIELD_CITY,
    USERS_GET_FIELD_FOLLOWERS,
    USERS_GET_FIELD_IS_ONLINE,
];
