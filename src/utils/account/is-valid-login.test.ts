import { isValidLogin } from './is-valid-login';

describe('Utils / Account / is-valid-login', () => {
    it('should pass valid login', () => {
        expect(isValidLogin('vlad805')).toBeTruthy();
        expect(isValidLogin('durov')).toBeTruthy();
        expect(isValidLogin('lolka')).toBeTruthy();
    });

    it('should do not pass login id-like', () => {
        expect(isValidLogin('id10')).toBeFalsy();
        expect(isValidLogin('id987')).toBeFalsy();
        expect(isValidLogin('idealist7')).toBeTruthy();
        expect(isValidLogin('pid77')).toBeTruthy();
    });

    it('should do not pass short and long logins', () => {
        expect(isValidLogin('ya')).toBeFalsy();
        expect(isValidLogin('i1')).toBeFalsy();
        expect(isValidLogin('thelongestloginintheworldever')).toBeFalsy();
    });
});
