import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { isBit } from '../../utils/is-bit';
import { Filter, filtersMap, SIGHTS_GET_FIELD_VISIT_STATE } from '../sights/keys';
import { checkBitmaskValid } from '../../utils/check-bitmask-valid';
import { ApiError, ErrorCode } from '../../error';
import SightFieldsManager from '../../utils/sights/sight-fields-manager';
import { IFieldsGetParamsBase, parseAndCheckArea } from './area';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';

/**
 * Правила для проверки корректности фильтров
 * Например, нельзя выбрать неверифицированные и верифицированные - это противоречит друг другу
 */
const filterRules: number[][] = [
    [Filter.VERIFIED, Filter.NOT_VERIFIED],
    [Filter.ARCHIVED, Filter.NOT_ARCHIVED],
    [Filter.WITH_PHOTO, Filter.WITHOUT_PHOTO],
];

type IFieldsGetParams = IFieldsGetParamsBase & {
    filters: number;
    fields: SightFieldsManager;
};

export default class MapGetSights extends OpenMethodAPI<IFieldsGetParams, IApiList<ISight>> {
    protected handleParams(params: IApiParams, props: ICompanion): IFieldsGetParams {
        const area = parseAndCheckArea(params.area as string);

        const filters = params.filters
            ? paramToArrayOf(params.filters as string)
                .map(key => filtersMap[key])
                .reduce((mask, item) => mask | item, 0)
            : 0;

        if (!checkBitmaskValid(filters, filterRules)) {
            throw new ApiError(ErrorCode.SIGHT_BITMASK_CONFLICT, 'Bitmask conflict');
        }

        return {
            area,
            filters,
            count: clamp(toNumber(params.count, 200), 1, 500),
            fields: new SightFieldsManager(params.fields as string),
        };
    }

    protected async perform(params: IFieldsGetParams, { database, session }: ICompanion): Promise<IApiList<ISight>> {
        // координаты области, которую нужно вернуть
        const [[lat1, lng1], [lat2, lng2]] = params.area;

        params.fields.setFilter(params.filters);

        // Для фильтров
        const filterWhere: string[] = [];

        // Для подстановок
        const values: unknown[] = [lat1, lat2, lng1, lng2, params.count];

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

        // Фильтр по наличию фотографии
        if (isBit(params.filters, Filter.WITH_PHOTO)) {
            filterWhere.push('`p`.`photoId` is not null');
        } else if (isBit(params.filters, Filter.WITHOUT_PHOTO)) {
            filterWhere.push('`p`.`photoId` is null');
        }

        // Фильтр по посещённости
        if (
            session &&
            params.fields.is(SIGHTS_GET_FIELD_VISIT_STATE) &&
            (
                isBit(params.filters, Filter.VISITED) ||
                isBit(params.filters, Filter.NOT_VISITED) ||
                isBit(params.filters, Filter.DESIRED)
            )
        ) {
            if (isBit(params.filters, Filter.NOT_VISITED)) {
                filterWhere.push('`sightVisit`.`state` is null');
            } else {
                const value = params.filters === Filter.VISITED ? 1 : 2;

                filterWhere.push('`sightVisit`.`state` = ' + value);
            }
        }

        const { joins, columns } = params.fields.build(session);

        const sql = `select \`pl\`.*, ${columns} from \`place\` \`pl\` ${joins} where (\`pl\`.\`latitude\` between ? and ?) and (\`pl\`.\`longitude\` between ? and ?) ${filterWhere.length ? ' and ' + filterWhere.join(' and ') : ''} group by \`sight\`.\`sightId\` limit ?`;

        const raw = await database.select<ISight>(sql, values);

        const items = raw.map(params.fields.handleResult);

        return { items };
    }
}
