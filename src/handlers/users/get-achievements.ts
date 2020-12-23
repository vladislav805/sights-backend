import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { PhotoType } from '../../types/photo';
import { VisitState } from '../../types/sight';

type IParams = {
    userId: number;
};

type IResult = {
    sights: {
        created: number;
        verified: number;
        visited: number;
        desired: number;
    };
    collections: {
        created: number;
    };
    photos: {
        uploaded: number;
    };
    comments: {
        added: number;
    };
};

const cache = new Map<number, IResult>();

export default class UsersGetAchievements extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            userId: toNumber(params.userId),
        };
    }

    protected async perform({ userId }: IParams, { session, database }: ICompanion): Promise<IResult> {
        if (cache.has(userId)) {
            return Promise.resolve(cache.get(userId)!);
        }

        const sql = 'select \
            (select count(*) from `sightVisit` WHERE `userId` = @u AND `state` = ?) AS `sights_visited`,\
            (select count(*) from `sightVisit` WHERE `userId` = @u AND `state` = ?) AS `sights_desired`,\
            (select count(*) from `sight` where `ownerId` = @u and (`mask` & 2) = 2) as `sights_verified`,\
            (select count(*) from `sight` where `ownerId` = @u) as `sights_created`,\
            (select count(*) from `comment` where `userId` = @u) as `comments_added`,\
            (0) AS `collections_created`,\
            (select count(*) from `photo` where `ownerId` = @u and `type` = ?) as `photos_uploaded`'.replace(/@u/ig, String(userId));

        type IQueryResult = {
            sights_visited: number;
            sights_verified: number;
            sights_created: number;
            sights_desired: number;
            photos_uploaded: number;
            collections_created: number;
            comments_added: number;
        };
        const [result] = await database.select<IQueryResult>(sql, [VisitState.VISITED, VisitState.DESIRED, PhotoType.SIGHT]);

        const response: IResult = {
            sights: {
                created: result.sights_created,
                verified: result.sights_verified,
                visited: result.sights_visited,
                desired: result.sights_desired,
            },
            photos: {
                uploaded: result.photos_uploaded,
            },
            collections: {
                created: result.collections_created,
            },
            comments: {
                added: result.comments_added,
            },
        };

        cache.set(userId, response);

        return response;
    }
}
