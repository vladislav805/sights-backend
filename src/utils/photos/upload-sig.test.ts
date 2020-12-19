import { getUploadSignature } from './upload-sig';
import { PhotoType } from '../../types/photo';

describe('Utils / photos / upload sig', () => {
    it('should return signature by input data', () => {
        expect(getUploadSignature(PhotoType.SIGHT, 444, 'abcdef')).toEqual('e927f946b466fd2782d06e08244a0d96');
    });
});
