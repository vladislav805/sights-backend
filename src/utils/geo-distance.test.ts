import getGeoDistance from './geo-distance';
import { IPoint } from '../types/point';

describe('Geo distance', () => {
    it('should return distance in meters between tow points', () => {
        const a: IPoint = {
            latitude: 60,
            longitude: 30,
        };
        const b: IPoint = {
            latitude: 61,
            longitude: 31,
        };
        expect(getGeoDistance(a, b)).toBeCloseTo(123941.820517, 5);
    });
});
