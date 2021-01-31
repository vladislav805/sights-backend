import { ISight } from './sight';
import { IPhoto } from './photo';
import { ICollection } from './collection';
import { IComment } from './comment';

export type IFeedItem = IFeedItemSight | IFeedItemPhoto | IFeedItemCollection | IFeedItemComment;

export type IFeedItemSight = {
    type: 'sight';
    actorId: number;
    date: number;
    sightId: number;
};

export type IFeedItemPhoto = {
    type: 'photo';
    actorId: number;
    date: number;
    photoId: number;
    sightId: number;
};

export type IFeedItemCollection = {
    type: 'collection';
    actorId: number;
    date: number;
    collectionId: number;
};

export type IFeedItemComment = {
    type: 'comment';
    actorId: number;
    date: number;
    commentId: number;
    sightId?: number;
    collectionId?: number;
};

export enum FeedItemRawType {
    SIGHT = 1,
    COLLECTION,
    PHOTO,
    COMMENT,
}

export type FeedItemRaw<T = ISight | ICollection | IPhoto | IComment> = {
    itemId: number;
    actorId: number;
    date: number;
    feedType: FeedItemRawType;
} & T;
