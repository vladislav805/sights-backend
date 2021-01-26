import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';

type IParams = {
    commentId: number;
};

export default class CommentsRemove extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const commentId = toNumber(params.commentId, 'commentId');

        return { commentId };
    }

    protected async perform(params: IParams, { database, session }: ICompanionPrivate): Promise<boolean> {
        // TODO: проверка на удаление комментария от имени автора достопримечательности или коллекции, а не коммента
        const sql = 'delete from `comment` where `commentId` = ? and `userId` = ?';

        const result = await database.apply(sql, [params.commentId, session?.userId]);

        return result.affectedRows > 0;
    }
}
