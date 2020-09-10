import { base64decode, base64encode } from './base64';

const inputData = 'test string with data';

describe('Utils / base64', () => {
    it('should returns base64 encoded string', () => {
        expect(base64encode(inputData)).toEqual('dGVzdCBzdHJpbmcgd2l0aCBkYXRh');
    });

    it('should returns base64 decoded string', () => {
        expect(base64decode('dGVzdCBzdHJpbmcgd2l0aCBkYXRh')).toEqual(inputData);
    });
});
