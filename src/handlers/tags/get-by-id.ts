import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ITag } from '../../types/tag';
import { paramToArrayOf } from '../../utils/param-to-array-of';

type IParams = {
    tagIds: number[];
};

export default class TagsGetById extends OpenMethodAPI<IParams, ITag[]> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const tagIds = paramToArrayOf(params.tagIds, Number).filter(Boolean);
        return { tagIds };
    }

    protected async perform(params: IParams, props: ICompanion): Promise<ITag[]> {
        if (!params.tagIds.length) {
            return [];
        }

        return params.tagIds.length
            ? props.database.select<ITag>(
                `select * from \`tag\` where \`tagId\` in (${params.tagIds.join(',')})`,
            )
            : [];
    }
}
