import { flatten } from 'lodash';
import differenceInsertDelete from './diff-insert-delete';
import getSightById from './get-sight';
import { ICompanionPrivate } from '../../handlers/method';
import { ApiError, ErrorCode } from '../../error';

export default async function setTags({ database, session }: ICompanionPrivate, sightId: number, newIds: number[]): Promise<boolean> {
    const sight = await getSightById(database, sightId);

    if (sight.ownerId !== session.userId && session.user?.status !== 'ADMIN') {
        throw new ApiError(ErrorCode.ACCESS_DENIED, 'Access denied');
    }

    type ITag = { tagId: number };
    const actualIds = await database.select<ITag>(
        'select `tagId` from `sightTag` where `sightId` = ?',
        [sightId],
    ).then(res => res.map(item => item.tagId));

    const { toDelete, toInsert } = differenceInsertDelete(actualIds, newIds);

    if (toDelete.length) {
        await database.apply(
            'delete from `sightTag` where `sightId` = ? and `tagId` in (?)',
            [sightId, toDelete],
        );
    }

    if (toInsert.length) {
        await database.apply(
            `insert into \`sightTag\` (\`sightId\`, \`tagId\`) values ${toInsert.map(() => '(?, ?)').join(',')}`,
            flatten(toInsert.map(id => [sightId, id])),
        );
    }

    return true;
}
