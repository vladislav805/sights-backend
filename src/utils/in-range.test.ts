import { inRange } from './in-range';

describe('In range', () => {
    it('should return true if value contains in range', () => {
        expect(inRange(5, 0, 10)).toBeTruthy();
        expect(inRange(-5, -10, 0)).toBeTruthy();
        expect(inRange(.5, 0, 1)).toBeTruthy();
        expect(inRange(0, 0, 1)).toBeTruthy();
        expect(inRange(1, 0, 1)).toBeTruthy();
    });

    it('should return false if value not contains in range', () => {
        expect(inRange(1, 5, 10)).toBeFalsy();
        expect(inRange(50, 0, 49)).toBeFalsy();
    });
});
