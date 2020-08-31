import { IMethodCallProps, PrivateMethodAPI } from '../method';
import { IComment } from '../../types/comment';
import { IApiParams } from '../../types/api';

type IParams = {
    sightId: number;
    text: string;
};

export default class CommentsAdd extends PrivateMethodAPI<IParams, IComment> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
        const sightId = +params.sightId;

        if (!sightId) {
            throw new Error('Parameter sightId is missing');
        }

        const text = (params.text as string)?.trim();

        if (!text) {
            throw new Error('Parameter text is missing');
        }

        return { sightId, text };
    }

    protected async perform({ sightId, text }: IParams, { session, database }: IMethodCallProps): Promise<IComment> {
        try {
            const sql = 'insert into `comment` (`sightId`, `userId`, `date`, `text`)  values (?, ?, unix_timestamp(now()), ?)';
            const res = await database.apply(sql, [sightId, session?.userId, text]);

            const commentId = res.insertId;

            const comment = await database.select<IComment>(
                'select * from `comment` where `commentId` = ?',
                [commentId],
            );

            return comment[0];
        } catch (e) {
            switch (e.errno) {
                case 1452: throw new Error('Sight not found');
                default: throw e;
            }
        }
    }
}
