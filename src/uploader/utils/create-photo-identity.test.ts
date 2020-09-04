import { createPhotoIdentity } from './create-photo-identity';

describe('Uploader utils / create photo identity', () => {
    it('should return path and filename', () => {
        const hash = 'abcdef01234';

        expect(createPhotoIdentity(hash, 'b')).toEqual({
            path: 'ab/cd',
            name: 'f01234.b.jpg',
        });
    });
});
