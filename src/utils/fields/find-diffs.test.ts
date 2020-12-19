import findDifferenceFields from './find-diffs';

describe('Utils / Fields / Find diffs', () => {
    it('should find differences between two maps of fields', () => {
        const a = {
            b: 'upd',
            c: 'rm',
            d: 'not modified',
        };
        const b = {
            a: 'new',
            b: 'def',
            d: 'not modified',
        };
        expect(findDifferenceFields(a, b)).toEqual({
            added: ['a'],
            modified: ['b'],
            removed: ['c'],
        });
    });

    it('should find mark as removed empty string', () => {
        const a = {
            a: '1',
            b: '2',
            c: '3',
        };
        const b = {
            a: '',
            b: 'def',
            c: '0',
            d: ' ',
        };
        expect(findDifferenceFields(a, b)).toEqual({
            added: [],
            modified: ['b', 'c'],
            removed: ['a'],
        });
    });
});
