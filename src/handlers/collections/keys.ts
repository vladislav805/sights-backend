import { ICollection } from '../../types/collection';

export const COLLECTION_ID = 'collectionId';
export const COLLECTION_OWNER_ID = 'ownerId';
export const COLLECTION_TYPE = 'type';
export const COLLECTION_TITLE = 'title';
export const COLLECTION_CONTENT = 'content';
export const COLLECTION_DATE_CREATED = 'dateCreated';
export const COLLECTION_DATE_UPDATED = 'dateUpdated';
export const COLLECTION_CITY_ID = 'cityId';
export const COLLECTION_SIZE = 'size';

export const COLLECTION_KEYS: (keyof ICollection)[] = [
    COLLECTION_ID,
    COLLECTION_OWNER_ID,
    COLLECTION_TYPE,
    COLLECTION_TITLE,
    COLLECTION_CONTENT,
    COLLECTION_DATE_CREATED,
    COLLECTION_DATE_UPDATED,
    COLLECTION_CITY_ID,
    COLLECTION_SIZE,
];
