import { IPlace } from '../types/place';

const { acos, cos, sin, PI } = Math;

const deg2rad = (angle: number): number => (angle / 180) * PI;

function getGeoDistance(a: IPlace, b: IPlace): number {
    const radYLat = deg2rad(b.latitude);
    const radXLat = deg2rad(a.latitude);

    return (
        6371000 * acos(
            cos(radYLat) * cos(radXLat) * cos(deg2rad(a.longitude) - deg2rad(b.longitude)) + sin(radYLat) * sin(radXLat)
        )
    );
}

export default getGeoDistance;
