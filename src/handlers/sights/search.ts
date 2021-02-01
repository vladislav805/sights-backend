import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';
import SightFieldsManager from '../../utils/sights/sight-fields-manager';
import { Filter, filtersMap, SIGHTS_GET_FIELD_RATING, SIGHTS_GET_FIELD_TAGS } from './keys';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { ApiError, ErrorCode } from '../../error';
import { checkBitmaskValid } from '../../utils/check-bitmask-valid';
import { FilterTuple, getSightsFilterQueryParts } from '../../utils/sights/create-filters';
import { toTheString } from '../../utils/to-string';

type IParams = {
    query: string;
    fields: SightFieldsManager;
    filters: number;
    cityId: number;
    categoryId: number;
    sort: Sort;
    count: number;
    offset: number;
    tagId?: number;
};

const allowedSort = [
    'dateCreated_asc',
    'dateCreated_desc',
    'dateUpdated_asc',
    'dateUpdated_desc',
    'rating',
] as const;

type Sort = typeof allowedSort[number];

const isValidSort = (sort: string): sort is Sort => allowedSort.includes(sort as Sort);

const filterRules: number[][] = [
    [Filter.VERIFIED, Filter.NOT_VERIFIED],
    [Filter.ARCHIVED, Filter.NOT_ARCHIVED],
    [Filter.WITH_PHOTO, Filter.WITHOUT_PHOTO],
];

// noinspection JSMethodCanBeStatic
export default class SightsSearch extends OpenMethodAPI<IParams, IApiList<ISight>> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const filters = params.filters
            ? paramToArrayOf(params.filters)
                .map(key => filtersMap[key])
                .reduce((mask, item) => mask | item, 0)
            : 0;

        if (!checkBitmaskValid(filters, filterRules)) {
            throw new ApiError(ErrorCode.SIGHT_BITMASK_CONFLICT, 'Bitmask conflict');
        }

        const rawSort = toTheString(params.sort, 'dateCreated_desc');

        const sort: Sort = isValidSort(rawSort)
            ? rawSort
            : 'dateCreated_desc';

        return {
            query: toTheString(params.query, true),
            fields: new SightFieldsManager(toTheString(params.fields, true)),
            filters,
            cityId: toNumber(params.cityId, 0),
            categoryId: toNumber(params.categoryId, 0),
            sort,
            count: clamp(toNumber(params.count, 50), 1, 100),
            offset: toNumber(params.offset, 0),
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IApiList<ISight>> {
        if (params.query.startsWith('#')) {
            const space = params.query.indexOf(' ');
            const hashtag = params.query.slice(1, space > 0 ? space : params.query.length);

            params.tagId = await this.getTagId(companion, hashtag);

            params.fields.add(SIGHTS_GET_FIELD_TAGS);
        }

        const filters = this.getFilterStrings(companion, params);

        const count = await this.count(companion, params, filters);
        const items = await this.items(companion, params, filters);

        return {
            count,
            items,
        };
    }

    private async getTagId(companion: ICompanion, hashtag: string): Promise<number> {
        const result = await companion.database.select<{ tagId: number }>(
            'select `tagId` from `tag` where `title` = ?',
            [hashtag.toLowerCase()],
        );

        if (!result.length) {
            throw new ApiError(ErrorCode.TAG_NOT_FOUND);
        }

        return result[0].tagId;
    }

    private getFilterStrings(companion: ICompanion, params: IParams): FilterTuple {
        params.fields.setFilter(params.filters);

        const [where, values] = getSightsFilterQueryParts(companion, params.filters, params.fields);

        // Если тег, а не поисковый запрос
        if (params.tagId) {
            where.push('`sightTag`.`tagId` = ?');
            values.push(params.tagId);
        } else if (params.query) {
            where.push('(`sight`.`title` like ? or `sight`.`description` like ?)');
            values.push(`%${params.query}%`, `%${params.query}%`);
        }

        // Категория
        if (params.categoryId) {
            where.push('`sight`.`categoryId` = ?');
            values.push(params.categoryId);
        }

        // Город
        if (params.cityId) {
            where.push('`sight`.`cityId` = ?');
            values.push(params.cityId);
        }

        return [where, values];
    }

    private async count(companion: ICompanion, params: IParams, [where, values]: FilterTuple): Promise<number> {
        if (params.tagId) {
            return companion.database.count(
                'select count(*) as `count` from `sight` left join `sightTag` on `sight`.`sightId` = `sightTag`.`sightId` where `sightTag`.`tagId` = ? and ' + where.join(' and '),
                [params.tagId, ...values],
            );
        } else {
            return companion.database.count(
                'select count(*) as `count` from `sight` where (`title` like ? or `description` like ?) and ' + where.join(' and ') + '',
                [`%${params.query}%`, `%${params.query}%`, ...values],
            );
        }
    }

    private async items(companion: ICompanion, params: IParams, filters: FilterTuple): Promise<ISight[]> {
        const [where, values] = filters;

        values.push(params.offset, params.count);

        const orderBy = this.getSortQueryString(params.sort!, params.fields);
        const { joins, columns } = params.fields.build(companion.session);

        const sql = `select \`pl\`.*, ${columns} from \`place\` \`pl\` ${joins} where ${where.join(' and ')} group by \`sight\`.\`sightId\` order by ${orderBy} limit ?,?`;

        const raw = await companion.database.select<ISight>(sql, values);
console.log(sql, values);
        return raw.map(params.fields.handleResult);
    }

    private getSortQueryString(sort: Sort, params: SightFieldsManager): string {
        const desc = sort.includes('_desc') ? 'desc' : 'asc';
        switch (sort) {
            case 'rating': {
                params.add(SIGHTS_GET_FIELD_RATING);
                return '`sight`.`rating` desc';
            }

            case 'dateCreated_asc':
            case 'dateCreated_desc': {
                return '`sight`.`dateCreated` ' + desc;
            }

            case 'dateUpdated_asc':
            case 'dateUpdated_desc': {
                return '`sight`.`dateUpdated` ' + desc;
            }
        }
    }
}
