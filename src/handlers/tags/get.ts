import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ITag } from '../../types/tag';
import { clamp } from '../../utils/clamp';

type IParams = {
    count: number;
    offset: number;
};

const TTL = 5000;

export default class TagsGet extends OpenMethodAPI<IParams, IApiList<ITag>> {
    private ttl: number = 0;
    private _cache: ITag[];

    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParams {
        return {
            count: clamp(+params.count || 20, 1, 50),
            offset: +params.offset || 0,
        };
    }

    protected async perform({ count, offset }: IParams, { database }: ICallPropsOpen): Promise<IApiList<ITag>> {
        const now = Date.now();

        // нет кэша или он просрочен
        if (!this._cache || now - this.ttl > TTL) {
            this.ttl = now;
            this._cache = await database.select<ITag>('select * from `tag`');
        }

        return {
            count: this._cache.length,
            items: this._cache.slice(offset, offset + count),
        };
    }
}
