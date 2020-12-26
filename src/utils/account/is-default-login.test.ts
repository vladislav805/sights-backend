import { isDefaultLogin } from './is-default-login';

describe('Utils / Account / is-default-login', () => {
    it('should check login', () => {
        expect(isDefaultLogin('id1')).toBeTruthy();
        expect(isDefaultLogin('id779')).toBeTruthy();
        expect(isDefaultLogin('id7a')).toBeFalsy();
        expect(isDefaultLogin('ide7')).toBeFalsy();
        expect(isDefaultLogin('7id')).toBeFalsy();
    });
});
