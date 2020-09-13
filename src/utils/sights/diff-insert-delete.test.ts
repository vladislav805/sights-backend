import differenceInsertDelete from './diff-insert-delete';

describe('Utils / difference to insert and delete', () => {
    it('should returns two arrays', () => {
        const a = [1, 7, 8, 20];
        const b = [1, 6, 8, 14, 18];

        expect(differenceInsertDelete(a, b)).toEqual({
            toDelete: [7, 20],
            toInsert: [6, 14, 18],
        });
    });

    it('should insert all if input empty', () => {
        const a = [];
        const b = [1, 6, 8, 14, 18];

        expect(differenceInsertDelete(a, b)).toEqual({
            toDelete: [],
            toInsert: [1, 6, 8, 14, 18],
        });
    });

    it('should delete all if output empty', () => {
        const a = [1, 6, 8, 14, 18];
        const b = [];

        expect(differenceInsertDelete(a, b)).toEqual({
            toDelete: [1, 6, 8, 14, 18],
            toInsert: [],
        });
    });
});
