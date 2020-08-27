import { ICity } from '../../types/city';

export const CITY_ID = 'cityId';
export const CITY_NAME = 'name';
export const CITY_NAME4CHILD = 'name4child';
export const CITY_PARENT_ID = 'parentId';

export const CITY_KEYS: (keyof ICity)[] = [
    CITY_ID,
    CITY_NAME,
    CITY_NAME4CHILD,
    CITY_PARENT_ID,
];
