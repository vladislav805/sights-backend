import { IMethodCallProps, OpenMethodAPI } from '../method';
import { IApiListExtended, IApiParams } from '../../types/api';
import { IComment } from '../../types/comment';
import UsersGet from '../users/get';
import { clamp } from '../../utils/clamp';

type IParams = {
    sightId: number;
    count: number;
    offset: number;
};

export default class CommentsGet extends OpenMethodAPI<IParams, IApiListExtended<IComment>> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
        const sightId = Number(params.sightId);

        if (isNaN(sightId)) {
            throw new Error('Invalid sightId');
        }

        return {
            sightId,
            count: clamp(+params.count || 50, 1, 200),
            offset: +params.offset || 0,
        };
    }

    protected async perform(params: IParams, props: IMethodCallProps): Promise<IApiListExtended<IComment>> {
        const db = await (await this.getDatabase()).getConnection();

        const count = await db.query({
            sql: 'select count(*) as `count` from `comment` where `sightId` = ?',
            values: [params.sightId],
        });

        const { offset, count: limit, sightId } = params;

        let items: IComment[] = await db.query({
            sql: `select * from \`comment\` where \`sightId\` = ? order by \`commentId\` limit ${offset},${limit}`,
            values: [sightId],
        });

        db.destroy();

        if (props.session !== null) {
            items = items.map(comment => {
                comment.canModify = props.session?.userId === comment.userId;
                return comment;
            });
        }

        const userIds = items.map(comment => comment.userId);

        return {
            count: count[0].count,
            items,
            users: await new UsersGet(this.props).call({ userIds }, props)
        };
    }
}
