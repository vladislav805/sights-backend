import { ISight } from '../../types/sight';
import { IDatabaseBundle } from '../../database';

export default async function getSightById(database: IDatabaseBundle, sightId: number): Promise<ISight | undefined> {
    const result = await database.select<ISight>(
        'select * from `sight` where `sightId` = ?',
        [sightId],
    );

    return result?.[0];
}
