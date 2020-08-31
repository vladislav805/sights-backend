import { IMethodCallProps, OpenMethodAPI } from '../method';
import { IUser } from '../../types/user';
import { ApiParam } from '../../types/api';
import { packIdentitiesToSql, unpackObject } from '../../utils/sql-packer-id';
import { IPhotoRaw } from '../../types/photo';
import raw2object from '../../utils/photos/raw-to-object';
import { ICity } from '../../types/city';
import { USER_KEYS, USERS_GET_FIELD_CITY, USERS_GET_FIELD_FOLLOWERS, USERS_GET_FIELD_PHOTO, USERS_GET_FIELDS_ALLOWED } from './keys';
import { PHOTO_KEYS } from '../photos/keys';
import { CITY_KEYS } from '../cities/keys';
import { paramToArrayOf } from '../../utils/param-to-array-of';

type UsersGetParams = {
    userIds: (number | string)[];
    fields: string[];
};

class UsersGet extends OpenMethodAPI<UsersGetParams, IUser[]> {
    public handleParams(params: Record<keyof UsersGetParams, ApiParam>, props: IMethodCallProps): UsersGetParams {
        let fields = params.fields;

        let ids: string[] = paramToArrayOf(params.userIds as string);

        if (!ids.length) {
            if (props.session) {
                ids = [String(props.session.userId)];
            } else {
                throw new Error('Not specified userIds');
            }
        }

        fields = paramToArrayOf<string>(fields as string);

        return {
            userIds: ids,
            fields: fields.filter(key => USERS_GET_FIELDS_ALLOWED.includes(key)),
        };
    }

    public async perform({ userIds, fields }: UsersGetParams, { session }: IMethodCallProps): Promise<IUser[]> {
        const cols: string[] = USER_KEYS.slice(0); // copy array
        const joins: string[] = [];
        const needPhoto: boolean = fields.includes(USERS_GET_FIELD_PHOTO);
        const needCity: boolean = fields.includes(USERS_GET_FIELD_CITY);
        const needFollowers: boolean = fields.includes(USERS_GET_FIELD_FOLLOWERS);

        const photoKey = 'pht';
        const cityKey = 'ct';

        // fields=photo
        if (needPhoto) {
            cols.push(...packIdentitiesToSql('photo', photoKey, PHOTO_KEYS));
            joins.push('left join `photo` on `photo`.`photoId` = `user`.`photoId`');
        }

        // fields=city
        if (needCity) {
            cols.push(...packIdentitiesToSql('city', cityKey, CITY_KEYS));
            joins.push('left join `city` on `city`.`cityId` = `user`.`cityId`');
        }

        // fields=followers
        if (needFollowers) {
            cols.push('getUserFollowersCount(`userId`) as `followers`');
        }

        const db = await this.getDatabase();

        const columns = cols.join(',');
        const ids = userIds.map(value => db.escape(value)).join(',');

        const users = await db.query({
            sql: `select ${columns} from \`user\` ${joins.join(' ')} where \`userId\` in (${ids})`,
        });

        return users.map((user: IUser) => {
            if (needPhoto) {
                const photo = unpackObject<IUser, IPhotoRaw>(user, photoKey, PHOTO_KEYS);

                user.photo = photo.photoId
                    ? raw2object(photo)
                    : null;
            }

            if (needCity) {
                const city = unpackObject<IUser, ICity>(user, cityKey, CITY_KEYS);

                user.city = city.cityId ? city : null;
            }

            return user;
        });
    }
}

export default UsersGet;
