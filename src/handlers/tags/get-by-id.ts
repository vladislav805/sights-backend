import { IMethodCallProps, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ITag } from '../../types/tag';
import { paramToArrayOf } from '../../utils/param-to-array-of';

type IParams = {
    tagIds: number[];
};

export default class TagsGetById extends OpenMethodAPI<IParams, ITag[]> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
        const tagIds = paramToArrayOf(params.tagIds as string, Number);
        return { tagIds };
    }

    protected async perform(params: IParams, props: IMethodCallProps): Promise<ITag[]> {
        return params.tagIds.length
            ? props.database.select<ITag>(
                `select * from \`tag\` where \`tagId\` in (${params.tagIds.join(',')})`,
            )
            : [];
    }
}
