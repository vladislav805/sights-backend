import { time } from './time';

describe('Utils / time', () => {
    it('should return current time in unixtime seconds', () => {
        expect(time()).toBeCloseTo(Math.floor(Date.now() / 1000), 1);
    });
});
