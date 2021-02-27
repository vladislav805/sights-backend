import * as qs from 'querystring';
import fetch from 'node-fetch';
import type { Coordinate, RouteResults } from 'osrm';

type Profile = 'car' | 'bike' | 'foot';

const flipCoordinates = (items: number[][]): [number, number][] => items.map(([lat, lng]) => [lng, lat]);

const stringifyCoordinates = (coordinates: Coordinate[]) => coordinates.map(c => c[0] + ',' + c[1]).join(';');

export type IRouteResult = {
    geometry: Coordinate[];
    distance: number;
    duration: number;
    parts: {
        distance: number;
        duration: number;
    }[];
};

/**
 * Генерация маршрута с возвратом путевых точек для отрисовки на карте
 *
 * @param coordinates Координаты в формате [latitude, longitude]
 * @param profile Профиль для построения маршрута
 * @returns Маршрут и полезная информация о нём
 */
export const getRoute = async(coordinates: Coordinate[], profile: Profile): Promise<IRouteResult> => {
    const options = {
        geometries: 'geojson',
    };

    const coordinatesString = stringifyCoordinates(flipCoordinates(coordinates));

    const request = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${coordinatesString}.json?${qs.stringify(options)}`);
    const result = await request.json() as RouteResults & { code: string };

    if (result.code !== 'Ok') {
        throw new Error('Can\'t make route');
    }

    const route = result.routes[0];

    return {
        geometry: flipCoordinates(route.geometry.coordinates),
        duration: route.duration,
        distance: route.distance,
        parts: route.legs.map(leg => ({
            duration: leg.duration,
            distance: leg.distance,
        })),
    };
};
