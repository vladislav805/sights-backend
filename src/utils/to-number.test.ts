import { toNumber } from './to-number';

describe('to-number', () => {
    it('should return number', () => {
        expect(toNumber('123')).toEqual(123);
        expect(toNumber('0')).toEqual(0);
        expect(toNumber(0)).toEqual(0);
        expect(toNumber('-123')).toEqual(-123);
        expect(toNumber('8.6958')).toEqual(8.6958);
    });

    it('should throw exception on invalid number', () => {
        expect(() => toNumber('number')).toThrow();
        expect(() => toNumber('to2')).toThrow();
    });

    it('shouldn\'t throw exception on invalid number and return undefined', () => {
        expect(toNumber('number', true)).toBeNull();
        expect(toNumber('to2', true)).toBeNull();
    });

    it('should return default value', () => {
        expect(toNumber(null as unknown as number, 45)).toEqual(45);
        expect(toNumber('', 45)).toEqual(45);
        expect(toNumber('qwerty', 45)).toEqual(45);
    });

    it('should throw exception with custom message', () => {
        expect(() => toNumber('zzz', 'CustomErrorText')).toThrow(/CustomErrorText/);
    });
});
