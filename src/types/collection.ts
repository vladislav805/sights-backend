export type CollectionType = 'PUBLIC' | 'DRAFT' | 'NEURAL_RESULT';

export interface ICollection {
    collectionId: number;
    ownerId: number;
    type: CollectionType;
    title: string;
    content: string;
    dateCreated: number;
    dateUpdated: number;
    // tags: number[];
    cityId?: number;
    size: number;
}
