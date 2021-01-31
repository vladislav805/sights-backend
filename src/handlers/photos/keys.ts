import { IPhotoRaw, PhotoType } from '../../types/photo';

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

export const defaultRawPhoto: IPhotoRaw = {
    photoId: 0,
    path: '',
    width: 300,
    height: 300,
    photo200: 'none.png',
    photoMax: 'none.png',
    type: PhotoType.PROFILE,
    ownerId: 0,
    date: 0,
};
