import { delay } from './delay';

describe('Delay', () => {
    it('should call setTimeout with promise', async done => {
        const ms = 1000;
        const started = Date.now();

        await delay(ms);

        const delayed = Date.now();
        expect(delayed - started).toBeGreaterThanOrEqual(ms);
        done();
    });
});
