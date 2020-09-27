import { ISight } from '../../types/sight';
import { IPlace } from '../../types/place';

export const PLACE_KEYS: (keyof IPlace)[] = [
    'placeId',
    'latitude',
    'longitude',
];

export const SIGHT_KEYS: (keyof ISight)[] = [
    'sightId',
    'ownerId',
    'title',
    'description',
    'mask',
    'categoryId',
    'dateCreated',
    'dateUpdated',
];

export const SIGHTS_GET_FIELD_PHOTO = 'photo';
export const SIGHTS_GET_FIELD_TAGS = 'tags';
export const SIGHTS_GET_FIELD_CITY = 'city';
export const SIGHTS_GET_FIELD_VISIT_STATE = 'visitState';
export const SIGHTS_GET_FIELD_RATING = 'rating';

export const SIGHTS_GET_FIELDS_ALLOWED = [
    SIGHTS_GET_FIELD_PHOTO,
    SIGHTS_GET_FIELD_TAGS,
    SIGHTS_GET_FIELD_CITY,
    SIGHTS_GET_FIELD_VISIT_STATE,
    SIGHTS_GET_FIELD_RATING,
];

export const enum Filter {
    VERIFIED = 1 << 1, // 2 as database
    ARCHIVED = 1 << 2, // 4 as database
    NOT_VERIFIED = 1 << 11,
    NOT_ARCHIVED = 1 << 12,
    WITH_PHOTO = 1 << 13,
    WITHOUT_PHOTO = 1 << 14,
}

/**
 * Названия значений фильтров их битовая маска
 */
export const filtersMap: Record<string, number> = {
    'verified': Filter.VERIFIED,
    '!verified': Filter.NOT_VERIFIED,
    'archived': Filter.NOT_ARCHIVED,
    '!archived': Filter.ARCHIVED,
    'photo': Filter.WITH_PHOTO,
    '!photo': Filter.WITHOUT_PHOTO,
};
