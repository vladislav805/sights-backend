import { IMethodCallProps, OpenMethodAPI } from '../method';
import { IApiList } from '../../types/api';
import { ICategory } from '../../types/category';

export default class CategoriesGet extends OpenMethodAPI<never, IApiList<ICategory>> {
    protected async perform(params: never, props: IMethodCallProps): Promise<IApiList<ICategory>> {
        const items = await props.database.select<ICategory>(
            'select * from `category`',
        );
        return {
            count: items.length,
            items,
        };
    }
}
