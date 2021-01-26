import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IComment } from '../../types/comment';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { toNumber } from '../../utils/to-number';
import { toTheString } from '../../utils/to-string';
import { wrapIdentify } from '../../utils/sql-packer-id';

type IParams = {
    sightId?: number;
    collectionId?: number;
    text: string;
};

export default class CommentsAdd extends PrivateMethodAPI<IParams, IComment> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const sightId = toNumber(params.sightId, 0);
        const collectionId = toNumber(params.collectionId, 0);

        if (!sightId && !collectionId) {
            throw new ApiError(ErrorCode.UNKNOWN_SOURCE_COMMENT, 'Not specified sightId or collectionId');
        }

        const text = toTheString(params.text, null, 'text');

        return { sightId, collectionId, text };
    }

    protected async perform(params: IParams, { session, database }: ICompanionPrivate): Promise<IComment> {
        try {
            const key = wrapIdentify(params.sightId ? 'sightId' : 'collectionId');
            const id = params.sightId ? params.sightId : params.collectionId;

            const sql = `insert into \`comment\` (\`${key}\`, \`userId\`, \`date\`, \`text\`)  values (?, ?, unix_timestamp(now()), ?)`;
            const res = await database.apply(sql, [id, session?.userId, params.text]);

            const commentId = res.insertId;

            const comment = await database.select<IComment>(
                'select * from `comment` where `commentId` = ?',
                [commentId],
            );

            return {
                ...comment[0],
                canModify: true,
            } as IComment;
        } catch (e) {
            switch (e.errno) {
                case 1452: throw new ApiError(ErrorCode.NOT_EXISTING_SOURCE_COMMENT, 'Sight or collection not found');
                default: throw e;
            }
        }
    }
}
