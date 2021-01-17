import { ICompanion, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { ISightRating } from '../../types/sight';
import { ISession } from '../../types/session';
import { toNumber } from '../../utils/to-number';

type IParams = {
    sightId: number;
    rating: number;
};

export default class RatingSet extends PrivateMethodAPI<IParams, ISightRating> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const sightId = toNumber(params.sightId, 'sightId');
        const rating = toNumber(params.rating, 'rating');

        if (rating < 0 || rating > 5) {
            throw new ApiError(ErrorCode.RATING_INVALID_VALUE);
        }

        return { sightId, rating };
    }

    protected async perform({ sightId, rating }: IParams, companion: ICompanion<ISession>): Promise<ISightRating> {
        if (rating > 0) {
            const has = await RatingSet.hasCurrentUserRating(sightId, companion);

            const sql = has
                ? 'update `rating` set `rate` = ?, `date` = unix_timestamp(now()) where `sightId` = ? and `userId` = ?'
                : 'insert into `rating` (`rate`, `sightId`, `userId`, `date`) values (?, ?, ?, unix_timestamp(now()))';

            await companion.database.apply(sql, [rating, sightId, companion.session.userId]);
        } else {
            await companion.database.apply(
                'delete from `rating` where `sightId` = ? and `userId` = ?',
                [sightId, companion.session.userId],
            );
        }

        return RatingSet.getFreshStat(sightId, companion);
    }

    private static async hasCurrentUserRating(sightId: number, companion: ICompanion<ISession>): Promise<boolean> {
        const count = await companion.database.count(
            'select count(*) as `count` from `rating` where `sightId` = ? and `userId` = ?',
            [sightId, companion.session.userId],
        );

        return count > 0;
    }

    private static async getFreshStat(sightId: number, companion: ICompanion): Promise<ISightRating> {
        const [row] = await companion.database.select<ISightRating>(
            'select (select avg(`rate`) from `rating` where `sightId` = ?) as `value`, (select count(*) from `rating` where `sightId` = ?) as `count`, (select `rate` from `rating` where `sightId` = ? and `userId` = ?) as `rated`',
            [sightId, sightId, sightId, companion.session?.userId],
        );

        // fixme
        if (row.value === null) {
            row.value = 0;
        }

        return row;
    }
}
