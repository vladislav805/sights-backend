import { isRequiredSize } from './is-required-size';
import { GDImage } from 'node-gd';
import { PhotoType } from '../../types/photo';

describe('Uploader / is required size', () => {
    it('should return true on correct size', () => {
        expect(isRequiredSize({ width: 1400, height: 1400 } as GDImage, PhotoType.SIGHT)).toBeTruthy();
        expect(isRequiredSize({ width: 1400, height: 1400 } as GDImage, PhotoType.SIGHT)).toBeTruthy();
        expect(isRequiredSize({ width: 1280, height: 1400 } as GDImage, PhotoType.SIGHT)).toBeTruthy();
        expect(isRequiredSize({ width: 1400, height: 1280 } as GDImage, PhotoType.SIGHT_SUGGEST)).toBeTruthy();
        expect(isRequiredSize({ width: 1400, height: 1280 } as GDImage, PhotoType.PROFILE)).toBeTruthy();
    });

    it('should return false on less size', () => {
        expect(isRequiredSize({ width: 1379, height: 1279 } as GDImage, PhotoType.SIGHT)).toBeFalsy();
        expect(isRequiredSize({ width: 1399, height: 719 } as GDImage, PhotoType.SIGHT_SUGGEST)).toBeFalsy();
        expect(isRequiredSize({ width: 719, height: 500 } as GDImage, PhotoType.PROFILE)).toBeFalsy();
    });
});
