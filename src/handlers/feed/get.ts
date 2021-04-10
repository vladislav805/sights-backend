import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiListExtended, IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { ISight } from '../../types/sight';
import { IPhoto, IPhotoRaw } from '../../types/photo';
import { clamp } from '../../utils/clamp';
import { PLACE_KEYS, SIGHT_KEYS } from '../sights/keys';
import { getUsers } from '../../utils/users/get-users';
import { toTheString } from '../../utils/to-string';
import { ICollection } from '../../types/collection';
import { IComment } from '../../types/comment';
import { COLLECTION_KEYS } from '../collections/keys';
import { defaultRawPhoto, PHOTO_KEYS } from '../photos/keys';
import { COMMENT_KEYS } from '../comments/keys';
import { packIdentitiesToSql, unpackObject } from '../../utils/sql-packer-id';
import raw2object from '../../utils/photos/raw-to-object';
import { CacheStore } from '../../utils/api-cache';
import { ISession } from '../../types/session';
import { FeedItemRaw, FeedItemRawType, IFeedItem } from '../../types/feed';

type IParams = {
    count: number;
    offset: number;
    fields: string;
};

type IResult = IApiListExtended<IFeedItem> & {
    sights: ISight[];
    collections: ICollection[];
    photos: IPhoto[];
    comments: IComment[];
};

const feedTypeRawAs: Record<FeedItemRawType, 'sight' | 'collection' | 'photo' | 'comment'> = {
    [FeedItemRawType.SIGHT]: 'sight',
    [FeedItemRawType.COLLECTION]: 'collection',
    [FeedItemRawType.PHOTO]: 'photo',
    [FeedItemRawType.COMMENT]: 'comment',
}

const cacheKey = ({ count, offset }: IParams, session: ISession) => `${session.userId}_${count}_${offset}`;

export default class FeedGet extends PrivateMethodAPI<IParams, IResult> {
    private cache: CacheStore<IResult>;

    protected onInit() {
        this.cache = new CacheStore<IResult>(30);
    }

    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        return {
            count: clamp(toNumber(params.count, 20), 1, 75),
            offset: clamp(toNumber(params.offset, 0), 0, 250),
            fields: toTheString(params.fields, true),
        };
    }

    protected async perform(params: IParams, companion: ICompanionPrivate): Promise<IResult> {
        const CK = cacheKey(params, companion.session)
        const cached = this.cache.get(CK);

        if (cached) {
            return cached;
        }

        const feed = await companion.database.select<FeedItemRaw>(
            'select *, case 1\
                    when not isnull(`feed`.`sightId`) then 1 \
                    when not isnull(`feed`.`collectionId`) then 2 \
                    when not isnull(`feed`.`photoId`) then 3 \
                    when not isnull(`feed`.`commentId`) then 4 \
                end as `feedType` \
            from `feed` \
            left join `subscribe` on `subscribe`.`targetId` = `feed`.`actorId` \
            left join `sight` on `sight`.`sightId` = `feed`.`sightId` \
            left join `place` on `place`.`placeId` = `sight`.`placeId` \
            left join `collection` on `collection`.`collectionId` = `feed`.`collectionId` \
            left join `photo` on `photo`.`photoId` = `feed`.`photoId` \
            left join `sightPhoto` on `sightPhoto`.`photoId` = `photo`.`photoId` \
            left join `sight` `sp` on `sp`.`sightId` = `sightPhoto`.`sightId` \
            left join `comment` on `comment`.`commentId` = `feed`.`commentId` \
            left join `sight` `cs` on `cs`.`sightId` = `comment`.`sightId` \
            left join `collection` `cc` on `cc`.`collectionId` = `comment`.`collectionId` and `cc`.`type` = \'PUBLIC\' \
            where `subscribe`.`userId` = ? order by `feed`.`itemId` desc limit ?'
                .replace('*,', [
                    '`feed`.*',
                    ...packIdentitiesToSql('sight', 's', SIGHT_KEYS),
                    ...packIdentitiesToSql('place', 's', PLACE_KEYS),
                    ...packIdentitiesToSql('collection', 'c', COLLECTION_KEYS),
                    ...packIdentitiesToSql('photo', 'p', PHOTO_KEYS),
                    ...packIdentitiesToSql('comment', 'cm', COMMENT_KEYS),
                    ...packIdentitiesToSql('sp', 'sp', SIGHT_KEYS),
                    ...packIdentitiesToSql('cs', 'cms', SIGHT_KEYS),
                    ...packIdentitiesToSql('cc', 'cmc', COLLECTION_KEYS),
                ].join(', ') + ','),
            [companion.session.userId, params.count],
        );

        const sights: ISight[] = [];
        const photos: IPhoto[] = [];
        const collections: ICollection[] = [];
        const comments: IComment[] = [];

        const items = feed.map(item => {
            const type = feedTypeRawAs[item.feedType];
            const args: Record<string, number> = {};

            switch (type) {
                case 'sight': {
                    const sight = unpackObject<FeedItemRaw, ISight>(item, 's', [...PLACE_KEYS, ...SIGHT_KEYS]);
                    sights.push(sight);

                    args.sightId = sight.sightId;
                    break;
                }

                case 'collection': {
                    const collection = unpackObject<FeedItemRaw, ICollection>(item, 'c', COLLECTION_KEYS);
                    collections.push(collection);

                    args.collectionId = collection.collectionId;
                    break;
                }

                case 'photo': {
                    const sight = unpackObject<FeedItemRaw, ISight>(item, 'sp', [...PLACE_KEYS, ...SIGHT_KEYS]);
                    sights.push(sight);

                    let photo = unpackObject<FeedItemRaw, IPhotoRaw>(item, 'p', PHOTO_KEYS);
                    photo = raw2object(photo?.photoId ? photo : defaultRawPhoto);
                    photos.push(photo);

                    args.photoId = photo.photoId;
                    args.sightId = sight.sightId;
                    break;
                }

                case 'comment': {
                    const comment = unpackObject<FeedItemRaw, IComment>(item, 'cm', COMMENT_KEYS);
                    args.commentId = comment.commentId;

                    if (comment.sightId) {
                        sights.push(unpackObject<FeedItemRaw, ISight>(item, 'cms', [...PLACE_KEYS, ...SIGHT_KEYS]));
                        args.sightId = comment.sightId;
                    } else {
                        collections.push(unpackObject<FeedItemRaw, ICollection>(item, 'cmc', COLLECTION_KEYS));
                        args.collectionId = comment.collectionId;
                    }

                    comments.push(comment);
                    break;
                }
            }

            return {
                type,
                date: item.date,
                actorId: item.actorId,
                ...args,
            } as IFeedItem;
        });

        const userIds = items.reduce((ids, item) => {
            return ids.add(item.actorId);
        }, new Set<number>());
        const users = await getUsers([...userIds], params.fields, companion);

        const result = { items, users, sights, collections, photos, comments };

        this.cache.set(CK, result);
        return result
    }
}
