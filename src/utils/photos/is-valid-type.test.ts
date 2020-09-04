import { isValidPhotoType } from './is-valid-type';
import { PhotoType } from '../../types/photo';

describe('Is valid photo type', () => {
    it('should return true on valid values', () => {
        expect(isValidPhotoType(1)).toBeTruthy();
        expect(isValidPhotoType(PhotoType.PROFILE)).toBeTruthy();

        // для проверки конвертации типа из строки в число
        expect(isValidPhotoType('1' as unknown as number)).toBeTruthy();
    });

    it('should return false on invalid values', () => {
        expect(isValidPhotoType(7)).toBeFalsy();
        expect(isValidPhotoType(PhotoType.PROFILE + 5)).toBeFalsy();
        expect(isValidPhotoType('profile' as unknown as number)).toBeFalsy();
    });
});
