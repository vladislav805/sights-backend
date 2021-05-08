import { IPoint } from '../types/point';

const { acos, cos, sin, PI } = Math;

const deg2rad = (angle: number): number => (angle / 180) * PI;

function getGeoDistance(a: IPoint, b: IPoint): number {
    const radYLat = deg2rad(b.latitude);
    const radXLat = deg2rad(a.latitude);

    return (
        6371000 * acos(
            cos(radYLat) * cos(radXLat) * cos(deg2rad(a.longitude) - deg2rad(b.longitude)) + sin(radYLat) * sin(radXLat)
        )
    );
}

export function getLongestDistanceOfArray(items: IPoint[]): number {
    let longest: number = 0;

    for (let i = 0; i < items.length; ++i) {
        for (let j = i + 1; j < items.length; ++j) {
            const distance = getGeoDistance(items[i], items[j]);
            if (distance > longest) {
                longest = distance;
            }
        }
    }

    return longest;
}

export default getGeoDistance;
