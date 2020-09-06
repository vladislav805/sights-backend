import { IMethodCallProps, PrivateMethodAPI } from '../method';
import { IApiListExtended, IApiParams } from '../../types/api';
import { IFeedItem } from '../../types/feed';
import { toNumber } from '../../utils/to-number';
import { ISight } from '../../types/sight';
import { callMethod } from '../index';
import { IUser } from '../../types/user';
import { IPhoto } from '../../types/photo';
import { MONTH } from '../../date';

type IParams = {
    count: number;
    fields: string;
};

export default class FeedGet extends PrivateMethodAPI<IParams, IApiListExtended<IFeedItem>> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
        return {
            count: toNumber(params.count),
            fields: params.fields as string,
        };
    }

    protected async perform({ count, fields }: IParams, { database, session }: IMethodCallProps): Promise<IApiListExtended<IFeedItem>> {
        const dateLimit = Date.now() - MONTH;

        const sights = await database.select<ISight>(
            'select * from `sight` left join `subscribe` on `subscribe`.`targetId` = `sight`.`ownerId` where `subscribe`.`userId` = ? and `sight`.`dateCreated` > ? order by `sight`.`dateCreated` desc limit ?',
            [session?.userId, dateLimit, count],
        );

        const photos = await database.select<IPhoto>(
            'select * from `photo` left join `subscribe` on `subscribe`.`targetId` = `photo`.`ownerId` where `subscribe`.`userId` = ? and `photo`.`date` > ? order by `photo`.`date` desc limit ?',
            [session?.userId, dateLimit, count],
        );

        const items: IFeedItem[] = [
            ...sights.map(sight => ({
                type: 'sight',
                ownerId: sight.ownerId,
                date: sight.dateCreated,
                sight,
            }) as IFeedItem),
            ...photos.map(photo => ({
                type: 'photo',
                ownerId: photo.ownerId,
                date: photo.date,
                photo,
            }) as IFeedItem)
        ].sort((a, b) => b.date - a.date);

        const userIds: number[] = sights.map(sight => sight.ownerId);

        const users = await callMethod('users.get', { userIds, fields }) as IUser[];

        return {
            items,
            users,
        };
    }
}
