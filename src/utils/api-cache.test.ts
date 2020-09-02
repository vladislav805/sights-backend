import apiCache from './api-cache';
import { delay } from './delay';

describe('API cache', () => {
    it('should cache data', () => {
        const fn = jest.fn();

        const cache = apiCache(fn);
        cache('1');
        cache('1');
        cache('2');

        expect(fn).toBeCalledTimes(2);
    });

    it('should cache data with ttl', done => {
        let value = 0;
        const fn = jest.fn(() => ++value);

        const cache = apiCache(fn, 500);
        expect(cache('1')).toEqual(1);
        expect(cache('1')).toEqual(1);
        expect(cache('2')).toEqual(2);
        expect(cache('2')).toEqual(2);

        expect(fn).toBeCalledTimes(2);

        delay(500).then(() => {
            expect(cache('1')).toEqual(3); // dead

            expect(fn).toBeCalledTimes(3);

            done();
        });
    });

    it('should always lost cache value', () => {
        let value = 0;
        const fn = jest.fn(() => ++value);

        const cache = apiCache(fn, 0);
        expect(cache('1')).toEqual(1);
        expect(cache('1')).toEqual(2);
        expect(cache('2')).toEqual(3);
        expect(cache('2')).toEqual(4);

        expect(fn).toBeCalledTimes(4);
    });
});
