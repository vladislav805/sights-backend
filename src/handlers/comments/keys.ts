import { IComment } from '../../types/comment';

export const COMMENT_ID = 'commentId';
export const COMMENT_SIGHT_ID = 'sightId';
export const COMMENT_COLLECTION_ID = 'collectionId';
export const COMMENT_USER_ID = 'userId';
export const COMMENT_DATE = 'date';
export const COMMENT_TEXT = 'text';

export const COMMENT_KEYS: (keyof IComment)[] = [
    COMMENT_ID,
    COMMENT_SIGHT_ID,
    COMMENT_COLLECTION_ID,
    COMMENT_USER_ID,
    COMMENT_DATE,
    COMMENT_TEXT,
];
