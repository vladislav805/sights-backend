import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ICity } from '../../types/city';
import { build, ICityRaw } from './keys';

type IParams = {
    query: string;
    count: number; // = 50
    extended: boolean; // = false
};

type IResult = ICity[];

const cache = new Map<string, ICity[]>();

export default class CitiesSearch extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            query: String(params.query).toLowerCase(),
            count: +params.count || 10,
            extended: 'extended' in params && Boolean(params.extended),
        };
    }

    protected async perform({ count, query, extended }: IParams, { database }: ICompanion): Promise<IResult> {
        if (cache.has(query)) {
            return cache.get(query)!;
        }

        const { columns, joins, handleItem } = build(extended, true);

        const result = await database.select<ICityRaw>(
            `select ${columns} from \`city\` ${joins} where \`city\`.\`name\` like ? limit ?`,
            [`%${query}%`, count],
        );

        const items = result.map(handleItem);
        cache.set(query, items);

        return items;
    }
}
