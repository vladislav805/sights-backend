import { flatten } from 'lodash';
import differenceInsertDelete from './diff-insert-delete';
import getSightById from './get-sight';
import { ICompanionPrivate } from '../../handlers/method';
import { ApiError, ErrorCode } from '../../error';

/**
 * TODO: порядок фотографий с помощью orderId не работает
 */
export default async function setPhotos({ database, session }: ICompanionPrivate, sightId: number, newIds: number[]): Promise<boolean> {
    const sight = await getSightById(database, sightId);

    if (sight.ownerId !== session.userId && session.user?.status !== 'ADMIN') {
        throw new ApiError(ErrorCode.ACCESS_DENIED, 'Access denied');
    }

    type IPhotoId = { photoId: number; orderId: number; };
    const [actualIds, orderIds] = await database.select<IPhotoId>(
        'select `photoId`, `orderId` from `sightPhoto` where `sightId` = ?',
        [sightId],
    ).then(res => [res.map(item => item.photoId), res.map(item => item.orderId)]);

    const { toDelete, toInsert } = differenceInsertDelete(actualIds, newIds);

    if (toDelete.length) {
        await database.apply(
            'delete from `sightPhoto` where `sightId` = ? and `photoId` in (?)',
            [sightId, toDelete],
        );
    }

    const maxOrderId = Math.max(...orderIds);
    const orderId = (isFinite(maxOrderId) ? maxOrderId : 0) + 1;

    if (toInsert.length) {
        await database.apply(
            `insert into \`sightPhoto\` (\`sightId\`, \`photoId\`, \`orderId\`) values ${toInsert.map(() => '(?, ?, ?)').join(',')}`,
            flatten(toInsert.map((id, i) => [sightId, id, orderId + i])),
        );
    }

    return true;
}
