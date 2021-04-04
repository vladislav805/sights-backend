import { ISight } from './sight';
import { ICity } from './city';

export type CollectionType = 'PUBLIC' | 'PRIVATE' | 'DRAFT' | 'NEURAL_RESULT' | 'SYSTEM';

export interface ICollection {
    collectionId: number;
    ownerId: number;
    type: CollectionType;
    title: string;
    content: string;
    dateCreated: number;
    dateUpdated: number;
    // tags: number[];
    cityId: number;
    size: number;
    isSystem: boolean;

    city?: ICity | null;
    rating?: ICollectionRating;
}

export interface ICollectionExtended extends ICollection {
    items: ISight[];
}

export type ICollectionRating = {
    value: number;
    count: number;
    rated?: number;
};
