import { paramToArrayOf } from './param-to-array-of';

describe('Param to array of', () => {
    it('should nothing do with string and return it in array', () => {
        expect(paramToArrayOf('test')).toEqual(['test']);
    });

    it('should split string by commas and return it\'s in array', () => {
        expect(paramToArrayOf('first,second')).toEqual(['first', 'second']);
    });

    it('should split string with numbers by commas and return numbers as strings in array', () => {
        expect(paramToArrayOf('100,500,1,-5')).toEqual(['100', '500', '1', '-5']);
    });

    it('should split string with numbers by commas and return numbers as array of numbers', () => {
        expect(paramToArrayOf('100,500,1,-5', Number)).toEqual([100, 500, 1, -5]);
    });

    it('should return empty array if passed nothing and pass zero', () => {
        // empty string
        expect(paramToArrayOf('')).toEqual([]);

        // string with spaces only
        expect(paramToArrayOf('  ')).toEqual([]);

        // string with items with spaces only
        expect(paramToArrayOf('  ,  , ')).toEqual([]);

        // string with zero will return array with '0'
        expect(paramToArrayOf('0')).toEqual(['0']);
    });
});
