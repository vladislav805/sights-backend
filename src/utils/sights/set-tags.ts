import { IDatabaseBundle } from '../../database';
import { flatten } from 'lodash';
import differenceInsertDelete from './diff-insert-delete';

export default async function setTags(database: IDatabaseBundle, sightId: number, newIds: number[]): Promise<boolean> {
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
