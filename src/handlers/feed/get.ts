import { ICallPropsPrivate, PrivateMethodAPI } from '../method';
import { IApiListExtended, IApiParams } from '../../types/api';
import { IFeedItem } from '../../types/feed';
import { toNumber } from '../../utils/to-number';
import { ISight } from '../../types/sight';
import { callMethod } from '../index';
import { IUser } from '../../types/user';
import { IPhoto, IPhotoRaw, PhotoType } from '../../types/photo';
import { MONTH } from '../../date';
import { clamp } from '../../utils/clamp';
import { time } from '../../utils/time';
import raw2object from '../../utils/photos/raw-to-object';
import { packIdentitiesToSql, unpackObject } from '../../utils/sql-packer-id';
import { SIGHT_KEYS } from '../sights/keys';
import { IPlace } from '../../types/place';

type IParams = {
    count: number;
    fields: string;
};

export default class FeedGet extends PrivateMethodAPI<IParams, IApiListExtended<IFeedItem>> {
    protected handleParams(params: IApiParams, props: ICallPropsPrivate): IParams {
        return {
            count: clamp(toNumber(params.count) || 20, 1, 75),
            fields: params.fields as string,
        };
    }

    protected async perform({ count, fields }: IParams, { database, session }: ICallPropsPrivate): Promise<IApiListExtended<IFeedItem>> {
        const dateLimit = time() - MONTH;

        const sights = await database.select<ISight>(
            'select * from `sight` left join `subscribe` on `subscribe`.`targetId` = `sight`.`ownerId` left join `place` `p` on `sight`.`placeId` = `p`.`placeId` where `subscribe`.`userId` = ? and `sight`.`dateCreated` > ? order by `sight`.`dateCreated` desc limit ?',
            [session.userId, dateLimit, count],
        );

        const SIGHT_COLS = packIdentitiesToSql('sight', 's', SIGHT_KEYS);

        const photos = await database.select<IPhotoRaw>(
            'select `photo`.*, ' + SIGHT_COLS + ' from `photo` left join `subscribe` on `subscribe`.`targetId` = `photo`.`ownerId` left join `sightPhoto` on `photo`.`photoId` = `sightPhoto`.`photoId` left join `sight` on `sightPhoto`.`sightId` = `sight`.`sightId` where `subscribe`.`userId` = ? and `photo`.`type` = ? and `photo`.`date` > ? order by `photo`.`date` desc limit ?',
            [session.userId, PhotoType.SIGHT, dateLimit, count],
        );

        const items: IFeedItem[] = [
            ...sights.map(sight => ({
                type: 'sight',
                ownerId: sight.ownerId,
                date: sight.dateCreated,
                sight,
            }) as IFeedItem),
            ...photos.map(raw => {
                const photo = raw2object(raw);
                return ({
                    type: 'photo',
                    ownerId: photo.ownerId,
                    date: photo.date,
                    photo,
                    // todo fix it
                    sight: {
                        ...unpackObject<IPhoto & IPlace, ISight>(photo as unknown as any, 's', SIGHT_KEYS),
                    },
                }) as IFeedItem;
            }),
        ]
            .sort((a: IFeedItem, b: IFeedItem) => b.date - a.date)
            .slice(0, count);

        const userIds = items.map(item => item.ownerId);

        const users = await callMethod<IUser[]>('users.get', { userIds, fields });

        return {
            items,
            users,
        };
    }
}
