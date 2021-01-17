import { toTheString } from './to-string';
import { ApiParam } from '../types/api';

describe('Utils / toTheString', () => {
    it('should return source string', () => {
        expect(toTheString('test')).toEqual('test');
        expect(toTheString(123)).toEqual('123');
    });

    it('should throw exception on empty string without defaultValue or silent', () => {
        expect(() => toTheString('')).toThrow();
        expect(() => toTheString('   ')).toThrow();
        expect(() => toTheString(null as unknown as ApiParam)).toThrow();
        expect(() => toTheString(undefined as unknown as ApiParam)).toThrow();
    });

    it('should return default value if empty string', () => {
        expect(toTheString('', 'def')).toEqual('def');
        expect(toTheString('   ', 'def')).toEqual('def');
        expect(toTheString(null as unknown as ApiParam, 'def')).toEqual('def');
        expect(toTheString(undefined as unknown as ApiParam, 'def')).toEqual('def');
    });

    it('should return source string, even it empty with silent=true', () => {
        expect(toTheString('', true)).toEqual('');
        expect(toTheString('   ', true)).toEqual('');
        expect(toTheString(null as unknown as ApiParam, true)).toEqual('');
        expect(toTheString(undefined as unknown as ApiParam, true)).toEqual('');
    });

    it('should throw exception with field name on empty string without defaultValue or silent', () => {
        const exp = /abc/i;
        expect(() => toTheString('', null, 'abc')).toThrow(exp);
        expect(() => toTheString('   ', null, 'abc')).toThrow(exp);
        expect(() => toTheString(null as unknown as ApiParam, null, 'abc')).toThrow(exp);
        expect(() => toTheString(undefined as unknown as ApiParam, null, 'abc')).toThrow(exp);
    });
});
