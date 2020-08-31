import { IMethodCallProps, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';

type IParams = {
    commentId: number;
};

export default class CommentsRemove extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
        const commentId = +params.commentId;

        if (!commentId) {
            throw new Error('Parameter commentId not specified');
        }

        return {
            commentId,
        };
    }

    protected async perform(params: IParams, props: IMethodCallProps): Promise<boolean> {
        const db = await this.getDatabase();

        const sql = 'delete from `comment` where `commentId` = ? and `userId` = ?';

        const result = await db.query({
            sql,
            values: [params.commentId, props.session?.userId],
        });

        return result.affectedRows > 0;
    }
}
