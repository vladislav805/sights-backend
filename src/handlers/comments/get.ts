import { ICompanion, OpenMethodAPI } from '../method';
import { IApiListExtended, IApiParams } from '../../types/api';
import { IComment } from '../../types/comment';
import { clamp } from '../../utils/clamp';
import { toNumber } from '../../utils/to-number';
import { getUsers } from '../../utils/users/get-users';
import { toTheString } from '../../utils/to-string';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    sightId?: number;
    collectionId?: number;
    count: number;
    offset: number;
    fields: string;
};

export default class CommentsGet extends OpenMethodAPI<IParams, IApiListExtended<IComment>> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const sightId = toNumber(params.sightId, 0);
        const collectionId = toNumber(params.collectionId, 0);

        if (!sightId && !collectionId) {
            throw new ApiError(ErrorCode.UNKNOWN_SOURCE_COMMENT, 'Not specified sightId or collectionId');
        }

        return {
            sightId,
            collectionId,
            count: clamp(toNumber(params.count, 50), 1, 200),
            offset: toNumber(params.offset, 0),
            fields: toTheString(params.fields, true),
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IApiListExtended<IComment>> {
        const { database, session } = companion;

        const key = params.sightId ? 'sightId' : 'collectionId';
        const id = params.sightId ? params.sightId : params.collectionId;

        const count = await database.count(
            `select count(*) as \`count\` from \`comment\` where \`${key}\` = ?`,
            [id],
        );

        const { offset, count: limit } = params;

        let items: IComment[] = await database.select(
            `select * from \`comment\`  where \`${key}\` = ? order by \`commentId\` limit ?, ?`,
            [id, offset, limit],
        );

        if (session !== null) {
            // TODO: добавить проверку на авторство достопримечательностью или коллекцией
            items = items.map(comment => {
                comment.canModify = session.userId === comment.userId;
                return comment;
            });
        }

        const userIds = items.map(comment => comment.userId);

        const users = await getUsers(userIds, params.fields, companion);

        return { count, items, users };
    }
}
