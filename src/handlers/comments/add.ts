import { IMethodCallProps, PrivateMethodAPI } from '../method';
import { IComment } from '../../types/comment';
import { IApiParams } from '../../types/api';

type IParams = {
    sightId: number;
    text: string;
};

export default class CommentsAdd extends PrivateMethodAPI<IParams, IComment> {
    public handleParams(params: IApiParams, props: IMethodCallProps): IParams {
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

    protected async perform({ sightId, text }: IParams, props: IMethodCallProps): Promise<IComment> {
        const db = await (await this.getDatabase()).getConnection();

        try {
            const sql = 'insert into `comment` (`sightId`, `userId`, `date`, `text`)  values (?, ?, unix_timestamp(now()), ?)';
            const res = await db.query({
                sql,
                values: [sightId, props.session?.userId, text],
            });

            const commentId = res.insertId;

            const comment = await db.query({
                sql: 'select * from `comment` where `commentId` = ?',
                values: [commentId],
            });

            db.destroy();

            return comment[0];
        } catch (e) {
            switch (e.errno) {
                case 1452: throw new Error('Sight not found');
                default: throw e;
            }
        }
    }
}
