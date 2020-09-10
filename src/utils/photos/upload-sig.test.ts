import { getUploadSignature } from './upload-sig';
import { PhotoType } from '../../types/photo';

describe('Utils / photos / upload sig', () => {
    it('should return signature by input data', () => {
        expect(getUploadSignature(PhotoType.SIGHT, 444, 'abcdef')).toEqual('0dc6e2474df58caecb67580e672bfb01');
    });
});
