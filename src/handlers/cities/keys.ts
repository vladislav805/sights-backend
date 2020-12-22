import { ICity, ICityExtended } from '../../types/city';
import { wrapIdentify } from '../../utils/sql-packer-id';

export const CITY_ID = 'cityId';
export const CITY_NAME = 'name';
export const CITY_NAME4CHILD = 'name4child';
export const CITY_PARENT_ID = 'parentId';
export const CITY_DESCRIPTION = 'description';
export const CITY_RADIUS = 'radius';
export const CITY_LATITUDE = 'latitude';
export const CITY_LONGITUDE = 'longitude';

export const CITY_KEYS: (keyof ICity)[] = [
    CITY_ID,
    CITY_NAME,
];

type IBuildResult = {
    joins: string;
    columns: string;
    handleItem(city: ICityRaw): ICity;
};

const baseKeys: (keyof ICity)[] = [CITY_ID, CITY_NAME];
const extendedKeys: (keyof ICityExtended)[] = [...baseKeys, CITY_DESCRIPTION, CITY_RADIUS, CITY_LATITUDE, CITY_LONGITUDE];
const extendedParentKeys: string = [
    '`c`.`cityId` as `cp_cityId`',
    '`c`.`name4child` as `cp_name`',
].join(', ');

export type ICityRaw = ICity & {
    cp_cityId: number;
    cp_name: string;
};

export const build = (extended: boolean, all: boolean): IBuildResult => {
    return {
        columns: [
            ...(extended ? extendedKeys : baseKeys).map(key => `${wrapIdentify('city')}.${wrapIdentify(key)}`),
            all ? extendedParentKeys : '',
        ].filter(Boolean).join(', '),

        joins: all
            ? 'left join `city` `c` on `c`.`cityId` = `city`.`parentId`'
            : '',

        handleItem: ({ cp_cityId, cp_name, ...city }: ICityRaw): ICity => {
            return all && cp_cityId
                ? {
                    ...city,
                    parent: {
                        cityId: cp_cityId,
                        name: cp_name,
                    },
                }
                : city;
        },
    };
};
