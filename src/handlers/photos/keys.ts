import { IPhotoRaw } from '../../types/photo';

export const PHOTO_KEYS: (keyof IPhotoRaw)[] = [
    'photoId',
    'path',
    'photo200',
    'photoMax',
    'date',
    'type',
    'latitude',
    'longitude',
];
