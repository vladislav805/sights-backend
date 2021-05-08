export type INominatimResult = {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    place_rank: number;
    category: string;
    type: string;
    importance: number;
    addresstype: string;
    name: string | null;
    display_name: string;
    address: {
        house_number: string;
        road: string;
        suburb: string;
        village: string;
        city_district: string;
        city: string;
        state: string;
        region: string;
        postcode: string;
        country: string;
        country_code: string;
    };
    boundingbox: string[];
};

export const renderAddressFromNominatimObject = (item: INominatimResult) => {
    const { country, state, city, city_district, village, road, house_number } = item.address;
    return [
        country,
        state !== city && state,
        city,
        city_district,
        village,
        road,
        house_number,
    ].filter(Boolean).join(', ');
};
