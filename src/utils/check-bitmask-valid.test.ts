import { checkBitmaskValid } from './check-bitmask-valid';

describe('Check bitmask valid', () => {
    it('should return true, if no conflicts', () => {
        expect(checkBitmaskValid(1 | 2 | 4 | 16, [
            [1, 8],
            [2, 8, 32],
            [8, 16],
        ]));

        expect(checkBitmaskValid(1 | 16, [
            [2, 4, 32],
        ]));
    });

    it('should return true, if no rules', () => {
        expect(checkBitmaskValid(1 | 2 | 4 | 16, []));

        expect(checkBitmaskValid(1 | 16, [
            [],
        ]));
    });

    it('should return false, if has conflicts', () => {
        // Full
        expect(checkBitmaskValid(1 | 2 | 4, [
            [1, 2],
        ]));

        // Partially, min
        expect(checkBitmaskValid(1 | 16 | 32, [
            [1, 4, 32],
        ]));

        // Partially, max
        expect(checkBitmaskValid(1 | 4 | 16 | 32, [
            [1, 4, 8, 16, 32],
        ]));
    });
});
