import * as qs from 'querystring';
import fetch from 'node-fetch';
import type { Coordinate } from 'osrm';
import type { INominatimResult } from './common';
import { renderAddressFromNominatimObject } from './common';
import { CacheStore } from '../api-cache';

export type IAddressResult = {
    postcode: string;
    country: string;
    state: string;
    city: string;
    district: string;
    road: string;
    house: string;
    address: string;
};

const cache = new CacheStore<IAddressResult>(3600);

export const getAddressByCoordinate = async([lat, lon]: Coordinate): Promise<IAddressResult> => {
    const cacheKey = `${lat}_${lon}`;
    const cached = cache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const query = { format: 'jsonv2', lat, lon };
    const request = await fetch(`https://nominatim.openstreetmap.org/reverse?${qs.stringify(query)}`, {
        headers: {
            'accept-language': 'ru;q=1.0',
        },
    });
    const json = await request.json() as INominatimResult;
    const { postcode, country, state, city, city_district, village, road, house_number } = json.address;

    const result = {
        postcode,
        country,
        state,
        city: city ?? village,
        district: city_district,
        road,
        house: house_number,
        address: renderAddressFromNominatimObject(json),
    };

    cache.set(cacheKey, result);

    return result;
};
