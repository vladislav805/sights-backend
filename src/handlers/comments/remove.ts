import { ICallPropsPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { UnspecifiedParamError } from '../../error';

type IParams = {
    commentId: number;
};

export default class CommentsRemove extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICallPropsPrivate): IParams {
        const commentId = toNumber(params.commentId, true);

        if (!commentId) {
            throw new UnspecifiedParamError('commentId');
        }

        return { commentId };
    }

    protected async perform(params: IParams, { database, session }: ICallPropsPrivate): Promise<boolean> {
        const sql = 'delete from `comment` where `commentId` = ? and `userId` = ?';

        const result = await database.apply(sql, [params.commentId, session?.userId]);

        return result.affectedRows > 0;
    }
}
