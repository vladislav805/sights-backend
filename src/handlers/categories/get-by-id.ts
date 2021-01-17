import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ICategory } from '../../types/category';
import { paramToArrayOf } from '../../utils/param-to-array-of';

type IParams = {
    categoryIds: number[];
};

export default class CategoriesGetById extends OpenMethodAPI<IParams, ICategory[]> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const categoryIds = paramToArrayOf(params.categoryIds, Number);
        return { categoryIds };
    }

    protected async perform(params: IParams, props: ICompanion): Promise<ICategory[]> {
        return params.categoryIds.length
            ? props.database.select<ICategory>(
                `select * from \`category\` where \`categoryId\` in (${params.categoryIds.join(',')})`,
            )
            : [];
    }
}
