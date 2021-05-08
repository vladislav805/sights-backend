import * as qs from 'querystring';
import fetch from 'node-fetch';
import type { Coordinate, RouteResults, TripResults } from 'osrm';

export type RouteProfile = 'car' | 'bike' | 'foot';
export const supportedRouteProfiles: readonly RouteProfile[] = ['car', 'bike', 'foot'] as const;

const flipCoordinatesArray = (items: number[][]): [number, number][] =>
    items.map(([lat, lng]) => [lng, lat]);

const stringifyCoordinates = (coordinates: Coordinate[]) =>
    coordinates.map(c => c[0].toFixed(5) + ',' + c[1].toFixed(5)).join(';');

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
export const getRoute = async(coordinates: Coordinate[], profile: RouteProfile): Promise<IRouteResult> => {
    const options = {
        geometries: 'geojson',
    };

    const coordinatesString = stringifyCoordinates(flipCoordinatesArray(coordinates));

    const request = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${coordinatesString}.json?${qs.stringify(options)}`);
    const result = await request.json() as RouteResults & { code: string };

    if (result.code !== 'Ok') {
        throw new Error('Can\'t make route');
    }

    const route = result.routes[0];

    return {
        geometry: flipCoordinatesArray(route.geometry.coordinates),
        duration: route.duration,
        distance: route.distance,
        parts: route.legs.map(leg => ({
            summary: leg.summary,
            duration: leg.duration,
            distance: leg.distance,
        })),
    };
};

export const getRouteTrip = async(coordinates: Coordinate[], profile: RouteProfile): Promise<Coordinate[]> => {
    const options = {
        geometries: 'geojson',
        source: 'first',
        destination: 'last',
    };

    const coordinatesString = stringifyCoordinates(flipCoordinatesArray(coordinates));

    const request = await fetch(`https://router.project-osrm.org/trip/v1/${profile}/${coordinatesString}.json?${qs.stringify(options)}`);
    const result = await request.json() as TripResults & { code: string };

    if (result.code !== 'Ok') {
        throw new Error('Can\'t make route');
    }

    return flipCoordinatesArray(result.waypoints.map(waypoint => waypoint.location));
};
