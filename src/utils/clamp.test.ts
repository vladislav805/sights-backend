import { clamp } from './clamp';

describe('Clamp', () => {
    it('should return number between min and max', () => {
        expect(clamp(5, 0, 10)).toEqual(5);
        expect(clamp(50, 0, 100)).toEqual(50);
        expect(clamp(-5, -10, 0)).toEqual(-5);
        expect(clamp(0, 10, 10)).toEqual(10);
        expect(clamp(47, 0, 10)).toEqual(10);
    });
});
