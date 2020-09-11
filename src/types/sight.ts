import { ICity } from './city';
import { IPhoto } from './photo';
import { IPlace } from './place';
import { ICategory } from './category';

export interface ISight extends IPlace {
    sightId: number;
    ownerId: number;
    tags: number[];
    dateCreated: number;
    dateUpdated: number;
    title: string;
    description: string;
    mask: number;
    categoryId: number;
    city?: ICity | null;
    rating?: ISightRating;
    photo?: IPhoto | null;
    category?: ICategory | null;

    visitState?: VisitState;
    canModify?: boolean;
}

export interface ISightStat {
    visited: number;
    desired: number;
}

export interface ISightRating {
    value: number;
    count: number;
    rated?: number;
}

export const enum VisitState {
    NOT_VISITED = 0,
    VISITED = 1,
    DESIRED = 2,
}

export interface ISightDistance {
    sightId: number;
    distance: number;
}
