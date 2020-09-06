import { toBoolean } from './to-boolean';

describe('to-boolean', () => {
    it('should return true of false in depend of value', () => {
        expect(toBoolean('true')).toBeTruthy();
        expect(toBoolean('1')).toBeTruthy();
        expect(toBoolean('123')).toBeTruthy();
        expect(toBoolean('0')).toBeFalsy();
        expect(toBoolean('false')).toBeFalsy();
        expect(toBoolean('')).toBeFalsy();
        expect(toBoolean(null!)).toBeFalsy();
        expect(toBoolean(0)).toBeFalsy();
        expect(toBoolean(1)).toBeTruthy();
        expect(toBoolean(-1)).toBeTruthy();
    });
});
