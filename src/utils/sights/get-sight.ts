import { ISight } from '../../types/sight';
import { IDatabaseBundle } from '../../database';
import { ApiError, ErrorCode } from '../../error';

export default async function getSightById(database: IDatabaseBundle, sightId: number): Promise<ISight> {
    const result = await database.select<ISight>(
        'select * from `sight` where `sightId` = ?',
        [sightId],
    );

    if (!result || !result[0]) {
        throw new ApiError(ErrorCode.SIGHT_NOT_FOUND, 'Sight not found');
    }

    return result[0];
}
