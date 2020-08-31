import { ISight } from '../../types/sight';

export const SIGHT_KEYS: (keyof ISight)[] = [
    'sightId',
    'placeId',
    'ownerId',
    'title',
    'description',
    'mask',
    'latitude',
    'longitude',
    'category',
    'tags',
    'dateCreated',
    'dateUpdated',
];

export const SIGHTS_GET_FIELD_PHOTO = 'photo';
export const SIGHTS_GET_FIELD_TAGS = 'tags';
export const SIGHTS_GET_FIELD_CITY = 'city';
