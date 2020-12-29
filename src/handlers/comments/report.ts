import { ICompanionPrivate, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { ApiError, ErrorCode } from '../../error';
import { sendTelegramMessage } from '../../utils/telegram/send-message';
import config from '../../config';
import { IComment } from '../../types/comment';

type IParams = {
    commentId: number;
};

export default class CommentsReport extends OpenMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const commentId = toNumber(params.commentId, true);

        if (!commentId) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM);
        }

        return { commentId };
    }

    protected async perform(params: IParams, { database, session }: ICompanionPrivate): Promise<boolean> {
        const [comment] = await database.select<IComment & { sightId: number }>(
            'select * from `comment` where `commentId` = ?',
            [params.commentId],
        );

        sendTelegramMessage(`**Жалоба на комментарий**:\n\n__${comment.text}__\n\nhttps://${config.domain.MAIN}/sight/${comment.sightId}#comment${comment.commentId}`);

        return true;
    }
}
