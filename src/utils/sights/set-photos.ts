import { flatten } from 'lodash';
import differenceInsertDelete from './diff-insert-delete';
import getSightById from './get-sight';
import { ICompanionPrivate } from '../../handlers/method';
import { ApiError, ErrorCode } from '../../error';

export default async function setPhotos({ database, session }: ICompanionPrivate, sightId: number, newIds: number[]): Promise<boolean> {
    const sight = await getSightById(database, sightId);

    if (sight.ownerId !== session.userId) {
        throw new ApiError(ErrorCode.ACCESS_DENIED, 'Access denied');
    }

    type IPhotoId = { photoId: number };
    const actualIds = await database.select<IPhotoId>(
        'select `photoId` from `sightPhoto` where `sightId` = ?',
        [sightId],
    ).then(res => res.map(item => item.photoId));

    const { toDelete, toInsert } = differenceInsertDelete(actualIds, newIds);

    if (toDelete.length) {
        await database.apply(
            'delete from `sightPhoto` where `sightId` = ? and `photoId` in (?)',
            [sightId, toDelete],
        );
    }

    if (toInsert.length) {
        await database.apply(
            `insert into \`sightPhoto\` (\`sightId\`, \`photoId\`) values ${toInsert.map(() => '(?, ?)').join(',')}`,
            flatten(toInsert.map(id => [sightId, id])),
        );
    }

    return true;
}
