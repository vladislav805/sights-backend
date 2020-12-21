import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toBoolean } from '../../utils/to-boolean';
import { toNumber } from '../../utils/to-number';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    userId: number;
    follow: boolean;
};

type IResult = {
    result: boolean;
    count: number;
};

export default class UsersFollow extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const userId = toNumber(params.userId);
        const follow = toBoolean(params.follow);

        if (userId === props.session.userId) {
            throw new ApiError(ErrorCode.FOLLOW_YOURSELF, 'Can\'t follow to yourself');
        }

        return { userId, follow };
    }

    protected async perform({ userId, follow }: IParams, { database, session }: ICompanionPrivate): Promise<IResult> {
        const isFollowed = Boolean(await database.count('select isUserFollowed(?, ?) as `count`', [session.userId, userId]));

        if (isFollowed === follow) {
            throw new ApiError(
                isFollowed ? ErrorCode.ALREADY_FOLLOWING : ErrorCode.NOT_FOLLOWING,
                isFollowed ? 'Already followed' : 'Already not followed',
            );
        }

        const sql = !isFollowed
            ? 'insert into `subscribe` (`userId`, `targetId`) values (?, ?)'
            : 'delete from `subscribe` where `userId` = ? and `targetId` = ?';

        const result = await database.apply(sql, [session.userId, userId]);

        const count = await database.count('select count(*) as `count` from `subscribe` where `targetId` = ?', [
            userId,
        ]);

        return {
            result: (isFollowed ? result.affectedRows : result.insertId) > 0,
            count,
        };
    }
}
