import { ICompanion, OpenMethodAPI } from '../method';
import { IApiListExtended, IApiParams } from '../../types/api';
import { IComment } from '../../types/comment';
import { clamp } from '../../utils/clamp';
import { toNumber } from '../../utils/to-number';
import { getUsers } from '../../utils/users/get-users';
import { toTheString } from '../../utils/to-string';

type IParams = {
    sightId: number;
    count: number;
    offset: number;
    fields: string;
};

export default class CommentsGet extends OpenMethodAPI<IParams, IApiListExtended<IComment>> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const sightId = toNumber(params.sightId, 'sightId');

        return {
            sightId,
            count: clamp(toNumber(params.count, 50), 1, 200),
            offset: toNumber(params.offset, 0),
            fields: toTheString(params.fields, ''),
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IApiListExtended<IComment>> {
        const { database, session } = companion;
        const count = await database.count(
            'select count(*) as `count` from `comment` where `sightId` = ?',
            [params.sightId],
        );

        const { offset, count: limit, sightId } = params;

        let items: IComment[] = await database.select(
            `select * from \`comment\` where \`sightId\` = ? order by \`commentId\` limit ?, ?`,
            [sightId, offset, limit],
        );

        if (session !== null) {
            items = items.map(comment => {
                comment.canModify = session.userId === comment.userId;
                return comment;
            });
        }

        const userIds = items.map(comment => comment.userId);

        return {
            count,
            items,
            users: await getUsers(userIds, params.fields, companion),
        };
    }
}
