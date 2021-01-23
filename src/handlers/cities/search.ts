import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ICity } from '../../types/city';
import { build, ICityRaw } from './keys';
import { toTheString } from '../../utils/to-string';
import { toNumber } from '../../utils/to-number';
import { toBoolean } from '../../utils/to-boolean';
import { CacheStore } from '../../utils/api-cache';

type IParams = {
    query: string;
    count: number; // = 50
    extended: boolean; // = false
};

type IResult = ICity[];

export default class CitiesSearch extends OpenMethodAPI<IParams, IResult> {
    private cache: CacheStore<ICity[]>;

    protected onInit() {
        this.cache = new CacheStore<ICity[], string>(3600);
    }

    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            query: toTheString(params.query, null, 'query').toLowerCase(),
            count: toNumber(params.count, 10),
            extended: toBoolean(params.extended),
        };
    }

    protected async perform({ count, query, extended }: IParams, { database }: ICompanion): Promise<IResult> {
        const fromCache = this.cache.get(query);

        if (fromCache) {
            return fromCache;
        }

        const { columns, joins, handleItem } = build(extended, true);

        const result = await database.select<ICityRaw>(
            `select ${columns} from \`city\` ${joins} where \`city\`.\`name\` like ? limit ?`,
            [`%${query}%`, count],
        );

        const items = result.map(handleItem);
        this.cache.set(query, items);

        return items;
    }
}
