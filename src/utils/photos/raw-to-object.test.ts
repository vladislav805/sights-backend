import { IPhoto, IPhotoRaw, PhotoType } from '../../types/photo';
import { joinPhotoPath } from './join-path';
import raw2object from './raw-to-object';

describe('Photos: raw to object', () => {
    it('should remove path field and generate photo200 and photoMax fields', () => {
        const domain = process.env.DOMAIN_MEDIA = 'media.domain.net';
        const path = 'ab/cd';
        const raw: IPhotoRaw = {
            ownerId: 0,
            path,
            date: 1,
            latitude: 0,
            longitude: 0,
            photoId: 1,
            type: PhotoType.PROFILE,
            photo200: '200.jpg',
            photoMax: 'max.jpg',
        };

        const photo: IPhoto = raw2object(raw);

        expect(photo).not.toBe(raw);
        expect('path' in photo).toBeFalsy();
        expect(photo.photo200).toEqual(joinPhotoPath(domain, path, raw.photo200));
        expect(photo.photoMax).toEqual(joinPhotoPath(domain, path, raw.photoMax));
    });
});
