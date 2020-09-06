import { IMethodCallProps, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { packIdentitiesToSql, unpackObject } from '../../utils/sql-packer-id';
import { ICategory } from '../../types/category';
import { CATEGORY_KEYS } from '../categories/keys';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { isBit } from '../../utils/is-bit';
import { SIGHTS_GET_FIELD_CITY, SIGHTS_GET_FIELD_PHOTO } from './keys';
import { CITY_KEYS } from '../cities/keys';
import { ICity } from '../../types/city';
import { checkBitmaskValid } from '../../utils/check-bitmask-valid';
import { PHOTO_KEYS } from '../photos/keys';
import { IPhotoRaw } from '../../types/photo';
import raw2object from '../../utils/photos/raw-to-object';
import { ApiError, ErrorCode } from '../../error';

type IPointTuple = [number, number];

const enum Filter {
    VERIFIED = 1 << 1, // 2 as database
    ARCHIVED = 1 << 2, // 4 as database
    NOT_VERIFIED = 1 << 11,
    NOT_ARCHIVED = 1 << 12,
    WITH_PHOTO = 1 << 13,
    WITHOUT_PHOTO = 1 << 14,
}

/**
 * Названия значений фильтров их битовая маска
 */
const filtersMap: Record<string, number> = {
    'verified': Filter.VERIFIED,
    '!verified': Filter.NOT_VERIFIED,
    'archived': Filter.NOT_ARCHIVED,
    '!archived': Filter.ARCHIVED,
    'photo': Filter.WITH_PHOTO,
    '!photo': Filter.WITHOUT_PHOTO,
}

/**
 * Правила для проверки корректности фильтров
 * Например, нельзя выбрать неверифицированные и верифицированные - это противоречит друг другу
 */
const filterRules: number[][] = [
    [Filter.VERIFIED, Filter.NOT_VERIFIED],
    [Filter.ARCHIVED, Filter.NOT_ARCHIVED],
    [Filter.WITH_PHOTO, Filter.WITHOUT_PHOTO],
];

type ISightsGetParams = {
    area: [IPointTuple, IPointTuple]; // NE, SW
    filters: number;
    fields: string[];
};

export default class SightsGet extends OpenMethodAPI<ISightsGetParams, IApiList<ISight>> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): ISightsGetParams {
        const areaRaw = (params.area as string || '').split(';');

        if (areaRaw.length !== 2) {
            throw new ApiError(ErrorCode.PLACES_ONLY_TWO_POINTS, 'Supported only two points');
        }

        const area = areaRaw.map(point => {
            const coords = point.split(',');

            if (coords.length !== 2) {
                throw new ApiError(ErrorCode.PLACES_INVALID_AREA_FORMAT, 'Unknown point format');
            }

            return coords.map(Number);
        }) as [IPointTuple, IPointTuple];

        const filters = params.filters
            ? paramToArrayOf(params.filters as string)
                .map(key => filtersMap[key])
                .reduce((mask, item) => mask + item)
            : 0;

        if (!checkBitmaskValid(filters, filterRules)) {
            throw new ApiError(ErrorCode.SIGHT_BITMASK_CONFLICT, 'Bitmask conflict');
        }

        return {
            area,
            filters,
            fields: paramToArrayOf(params.fields as string),
        };
    }

    protected async perform(params: ISightsGetParams, { database }: IMethodCallProps): Promise<IApiList<ISight>> {
        const photoKey = 'ph';
        const cityKey = 'ct';
        const categoryKey = 'cg';

        // координаты области, которую нужно вернуть
        const [[lat1, lng1], [lat2, lng2]] = params.area;

        // Нужно ли возвращать информацию о городах
        const needCity = params.fields.includes(SIGHTS_GET_FIELD_CITY);

        // Есть ли фильтр по фоткам или запрашивается ли фотка, тогда нужно join'ить таблицы с фотками
        const photoFilter = isBit(params.filters, Filter.WITH_PHOTO) || isBit(params.filters, Filter.WITHOUT_PHOTO);
        const needPhoto = params.fields.includes(SIGHTS_GET_FIELD_PHOTO);
        const needJoinPhoto = needPhoto || photoFilter;

        // Возвращаем всё из `place` и `sight`, а также категории
        const returnFields = [
            packIdentitiesToSql('category', categoryKey, CATEGORY_KEYS),
        ];

        // Делаем выборку по координатам в `place`, выполняем join с `sight` и `category` по `sight`
        const filterJoin: string[] = [
            'left join `sight` on `place`.`placeId` = `sight`.`placeId`',
            'left join `category` on `category`.`categoryId` = `sight`.`categoryId`'
        ];

        // Для фильтров
        const filterWhere: string[] = [];

        // Для подстановок
        const values: unknown[] = [lat1, lat2, lng1, lng2];

        // Фильтры по подтверждённости и наоборот
        if (isBit(params.filters, Filter.VERIFIED)) {
            filterWhere.push('(`sight`.`mask` & 2) = 2');
        } else if (isBit(params.filters, Filter.NOT_VERIFIED)) {
            filterWhere.push('(`sight`.`mask` & 2) = 0');
        }

        // Фильтры по архивности и наоборот
        if (isBit(params.filters, Filter.ARCHIVED)) {
            filterWhere.push('(`sight`.`mask` & 4) = 4');
        } else if (isBit(params.filters, Filter.NOT_ARCHIVED)) {
            filterWhere.push('(`sight`.`mask` & 4) = 0');
        }

        // Если в запросе нужна информация по фоткам
        if (needJoinPhoto) {
            // join их
            filterJoin.push('left join `sightPhoto` on `sightPhoto`.`sightId` = `sight`.`sightId`');
            filterJoin.push('left join `photo` as `p` on `sightPhoto`.`photoId` = `p`.`photoId`');

            // Если нужны фотки
            if (needPhoto) {
                returnFields.push(packIdentitiesToSql('p', photoKey, PHOTO_KEYS));
            }

            // Если фильтр
            if (isBit(params.filters, Filter.WITH_PHOTO)) {
                filterWhere.push('`p`.`photoId` is not null');
            } else if (isBit(params.filters, Filter.WITHOUT_PHOTO)) {
                filterWhere.push('`p`.`photoId` is null');
            }
        }

        // Если нужны города
        if (needCity) {
            returnFields.push(packIdentitiesToSql('city', cityKey, CITY_KEYS));
            filterJoin.push('left join `city` on `sight`.`cityId` = `city`.`cityId`');
        }

        const sql =
'select ' +
    '`place`.*,' +
    '`sight`.*,' +
    returnFields.join(', ') +
' from ' +
    '`place` ' + filterJoin.join(' ') +
' where ' +
    '(`place`.`latitude` between ? and ?) and ' +
    '(`place`.`longitude` between ? and ?) ' +
    (filterWhere.length ? ' and ' + filterWhere.join(' and ') : '') +
' limit 20';

        const raw = await database.select<ISight>(sql, values);

        const items = raw.map(sight => {
            sight.category = unpackObject<ISight, ICategory>(sight, categoryKey, CATEGORY_KEYS);

            if (needCity) {
                sight.city = unpackObject<ISight, ICity>(sight, cityKey, CITY_KEYS);
            }

            if (needPhoto) {
                const photo: IPhotoRaw = unpackObject<ISight, IPhotoRaw>(sight, photoKey, PHOTO_KEYS);

                sight.photo = photo
                    ? raw2object(photo)
                    : null;
            }

            return sight;
        });

        return { items };
    }
}
