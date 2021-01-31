export interface IComment {
    commentId: number;
    sightId: number;
    collectionId: number;
    userId: number;
    date: number;
    text: string;
    canModify?: boolean;
}
