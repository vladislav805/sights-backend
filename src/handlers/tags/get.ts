import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ITag } from '../../types/tag';
import { clamp } from '../../utils/clamp';
import { CacheStore } from '../../utils/api-cache';
import { toNumber } from '../../utils/to-number';

type IParams = {
    count: number;
    offset: number;
};

export default class TagsGet extends OpenMethodAPI<IParams, IApiList<ITag>> {
    private cache: CacheStore<ITag[], number>;

    protected onInit() {
        this.cache = new CacheStore<ITag[], number>(3600);
    }

    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            count: clamp(toNumber(params.count, 20), 1, 50),
            offset: toNumber(params.offset, 0),
        };
    }

    protected async perform({ count, offset }: IParams, { database }: ICompanion): Promise<IApiList<ITag>> {
        let cached = this.cache.get(0);

        if (!cached) {
            cached = await database.select<ITag>('select * from `tag`')
            this.cache.set(0, cached);
        }

        return {
            count: cached.length,
            items: cached.slice(offset, offset + count),
        };
    }
}
