import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ITag } from '../../types/tag';
import { toTheString } from '../../utils/to-string';

type IParams = {
    query: string;
};

/**
 * На будущее: levenshtein distance
 */
export default class TagsSearch extends OpenMethodAPI<IParams, ITag[]> {
    private cache: Map<string, ITag[]> = new Map<string, ITag[]>();

    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            query: toTheString(params.query, null, 'query').toLowerCase(),
        };
    }

    protected async perform({ query }: IParams, props: ICompanion): Promise<ITag[]> {
        if (this.cache.has(query)) {
            return this.cache.get(query)!;
        }

        const sql = 'select * from `tag`';

        const items = (await props.database.select<ITag>(sql))
            .map(item => {
                const index = item.title.toLowerCase().indexOf(query);
                return { item, index };
            })
            .filter(item => ~item.index)
            .sort((a, b) => a.index - b.index)
            .map(({ item }) => item)
            .slice(10);

        this.cache.set(query, items);

        return items;
    }
}
