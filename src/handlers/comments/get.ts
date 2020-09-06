import { IMethodCallProps, OpenMethodAPI } from '../method';
import { IApiListExtended, IApiParams } from '../../types/api';
import { IComment } from '../../types/comment';
import { clamp } from '../../utils/clamp';
import { IUser } from '../../types/user';
import { toNumber } from '../../utils/to-number';

type IParams = {
    sightId: number;
    count: number;
    offset: number;
};

export default class CommentsGet extends OpenMethodAPI<IParams, IApiListExtended<IComment>> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
        const sightId = toNumber(params.sightId);

        return {
            sightId,
            count: clamp(+params.count || 50, 1, 200),
            offset: +params.offset || 0,
        };
    }

    protected async perform(params: IParams, { database, session, callMethod }: IMethodCallProps): Promise<IApiListExtended<IComment>> {
        const count = await database.select<{ count: number }>(
            'select count(*) as `count` from `comment` where `sightId` = ?',
            [params.sightId],
        );

        const { offset, count: limit, sightId } = params;

        let items: IComment[] = await database.select(
            `select * from \`comment\` where \`sightId\` = ? order by \`commentId\` limit ${offset},${limit}`,
            [sightId],
        );

        if (session !== null) {
            items = items.map(comment => {
                comment.canModify = session?.userId === comment.userId;
                return comment;
            });
        }

        const userIds = items.map(comment => comment.userId);

        return {
            count: count[0].count,
            items,
            users: await callMethod('users.get', { userIds }) as IUser[],
        };
    }
}
