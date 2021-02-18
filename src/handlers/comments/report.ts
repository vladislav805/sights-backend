import { ICompanion, ICompanionPrivate, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { sendTelegramMessage } from '../../utils/telegram/send-message';
import config from '../../config';
import { IComment } from '../../types/comment';

type IParams = {
    commentId: number;
};

export default class CommentsReport extends OpenMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const commentId = toNumber(params.commentId, 'commentId');

        return { commentId };
    }

    protected async perform(params: IParams, { database, session }: ICompanion): Promise<boolean> {
        const [comment] = await database.select<IComment>(
            'select * from `comment` where `commentId` = ?',
            [params.commentId],
        );

        if (!comment) {
            return false;
        }

        sendTelegramMessage(`**Жалоба на комментарий**:\n\n__${comment.text}__\n\nhttps://${config.domain.MAIN}/${comment.sightId ? 'sight' : 'collection'}/${comment.sightId ?? comment.collectionId}#comment${comment.commentId}\n\nЗарепортил ${session ? `[user${session.userId} / ${session.user?.login}](https://${config.domain.MAIN}/user/${session.userId})` : 'неавторизованный'}`);

        return true;
    }
}
