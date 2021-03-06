import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { PhotoType } from '../../types/photo';
import { VisitState } from '../../types/sight';
import { CacheStore } from '../../utils/api-cache';

type IParams = {
    userId: number;
};

type IResult = {
    sights: {
        created: number;
        verified: number;
        visited: number;
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

export default class UsersGetAchievements extends OpenMethodAPI<IParams, IResult> {
    private cache: CacheStore<IResult, number>;

    protected onInit() {
        this.cache = new CacheStore<IResult, number>(1800);
    }

    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            userId: toNumber(params.userId, 'userId'),
        };
    }

    protected async perform({ userId }: IParams, { session, database }: ICompanion): Promise<IResult> {
        const cached = this.cache.get(userId);

        if (cached) {
            return Promise.resolve(cached);
        }

        const sql = 'select \
            (select count(*) from `sightVisit` where `userId` = @u and `state` = ?) as `sights_visited`,\
            (select count(*) from `sight` where `ownerId` = @u and (`mask` & 2) = 2) as `sights_verified`,\
            (select count(*) from `sight` where `ownerId` = @u) as `sights_created`,\
            (select count(*) from `comment` where `userId` = @u) as `comments_added`,\
            (select count(*) from `collection` where `ownerId` = @u) as `collections_created`,\
            (select count(*) from `photo` where `ownerId` = @u and `type` = ?) as `photos_uploaded`'.replace(/@u/ig, String(userId));

        type IQueryResult = {
            sights_visited: number;
            sights_verified: number;
            sights_created: number;
            photos_uploaded: number;
            collections_created: number;
            comments_added: number;
        };
        const [result] = await database.select<IQueryResult>(sql, [VisitState.VISITED, PhotoType.SIGHT]);

        const response: IResult = {
            sights: {
                created: result.sights_created,
                verified: result.sights_verified,
                visited: result.sights_visited,
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

        this.cache.set(userId, response);

        return response;
    }
}
