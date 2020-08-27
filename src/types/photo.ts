export interface IPhoto {
    ownerId: number;
    photoId: number;
    type: PhotoType;
    date: number;
    photo200: string;
    photoMax: string;
    latitude?: number;
    longitude?: number;
}

export interface IPhotoRaw extends IPhoto {
    path: string;
}

export const enum PhotoType {
    SIGHT = 1,
    PROFILE = 2,
    SIGHT_SUGGEST = 4
}
