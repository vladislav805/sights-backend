import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiList } from '../../types/api';
import { ICategory } from '../../types/category';

const TTL = 5000;

export default class CategoriesGet extends OpenMethodAPI<never, IApiList<ICategory>> {
    private ttl: number = 0;
    private _cache: IApiList<ICategory>;

    protected async perform(params: never, { database }: ICallPropsOpen): Promise<IApiList<ICategory>> {
        const now = Date.now();

        if (now - this.ttl <= TTL) {
            return this._cache;
        }

        this.ttl = now;

        const items = await database.select<ICategory>(
            'select * from `category`',
        );

        return this._cache = {
            count: items.length,
            items,
        };
    }
}
