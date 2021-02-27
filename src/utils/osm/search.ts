import fetch from 'node-fetch';
import * as qs from 'querystring';
import type { INominatimResult } from './common';
import { renderAddressFromNominatimObject } from './common';
import { CacheStore } from '../api-cache';

export type ISearchItem = {
    latitude: number;
    longitude: number;
    address: string;
};

const cache = new CacheStore<ISearchItem[]>(3600);

export const searchByQuery = async(query: string, limit: number = 10, viewBox?: string): Promise<ISearchItem[]> => {
    const cached = cache.get(query);

    if (cached) {
        return cached;
    }

    const options = {
        format: 'jsonv2',
        addressdetails: '1',
        street: query,
        countrycodes: 'ru',
        viewbox: viewBox,
        limit,
    };

    const request = await fetch(`https://nominatim.openstreetmap.org/search?${qs.stringify(options)}`);
    const items = await request.json() as INominatimResult[];

    const result = items.map(item => ({
        latitude: +item.lat,
        longitude: +item.lon,
        address: renderAddressFromNominatimObject(item),
    }));

    cache.set(query, result);

    return result;
};
