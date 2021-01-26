import { ICompanion, ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { ISightRating } from '../../types/sight';
import { toNumber } from '../../utils/to-number';
import { wrapIdentify } from '../../utils/sql-packer-id';

type IParams = {
    sightId: number;
    collectionId: number;
    rating: number;
};

const stmt = (str: string, name: string): string => str.replace(/\${key}/igm, name);

export default class RatingSet extends PrivateMethodAPI<IParams, ISightRating> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const sightId = toNumber(params.sightId, 0);
        const collectionId = toNumber(params.collectionId, 0);
        const rating = toNumber(params.rating, 'rating');

        if (!sightId && !collectionId) {
            throw new ApiError(ErrorCode.UNKNOWN_SOURCE_RATING, 'Not specified sightId or collectionId');
        }

        if (rating < 0 || rating > 5) {
            throw new ApiError(ErrorCode.RATING_INVALID_VALUE);
        }

        return { sightId, collectionId, rating };
    }

    protected async perform({ sightId, collectionId, rating }: IParams, companion: ICompanionPrivate): Promise<ISightRating> {
        const key = wrapIdentify(Boolean(sightId) ? 'sightId' : 'collectionId');
        const id = sightId ?? collectionId;

        if (rating > 0) {
            const has = await RatingSet.hasCurrentUserRating(key, id, companion);

            // noinspection SqlInsertValues
            const sql = has
                ? 'update `rating` set `rate` = ?, `date` = unix_timestamp(now()) where ${key} = ? and `userId` = ?'
                : 'insert into `rating` (`rate`, ${key}, `userId`, `date`) values (?, ?, ?, unix_timestamp(now()))';

            await companion.database.apply(stmt(sql, key), [rating, id, companion.session.userId]);
        } else {
            await companion.database.apply(
                stmt('delete from `rating` where ${key} = ? and `userId` = ?', key),
                [id, companion.session.userId],
            );
        }

        return RatingSet.getFreshStat(key, id, companion);
    }

    private static async hasCurrentUserRating(key: string, id: number, companion: ICompanionPrivate): Promise<boolean> {
        const count = await companion.database.count(
            stmt('select count(*) as `count` from `rating` where ${key} = ? and `userId` = ?', key),
            [id, companion.session.userId],
        );

        return count > 0;
    }

    private static async getFreshStat(key: string, id: number, companion: ICompanion): Promise<ISightRating> {
        const [row] = await companion.database.select<ISightRating>(
            stmt('select (select avg(`rate`) from `rating` where ${key} = ?) as `value`, (select count(*) from `rating` where ${key} = ?) as `count`, (select `rate` from `rating` where ${key} = ? and `userId` = ?) as `rated`', key),
            [id, id, id, companion.session?.userId],
        );

        // fixme
        if (row.value === null) {
            row.value = 0;
        }

        return row;
    }
}
