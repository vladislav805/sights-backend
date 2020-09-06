import { IUser } from '../../types/user';
import { USER_KEYS, USERS_GET_FIELD_CITY, USERS_GET_FIELD_FOLLOWERS, USERS_GET_FIELD_IS_FOLLOWING, USERS_GET_FIELD_PHOTO } from '../../handlers/users/keys';
import { packIdentitiesToSql, unpackObject, wrapIdentify } from '../sql-packer-id';
import { PHOTO_KEYS } from '../../handlers/photos/keys';
import { CITY_KEYS } from '../../handlers/cities/keys';
import { IPhotoRaw } from '../../types/photo';
import raw2object from '../photos/raw-to-object';
import { ICity } from '../../types/city';
import { BuildResult, FieldsManager } from '../fields-manager';
import { ISession } from '../../types/session';

const UFM_PHOTO = 'pt';
const UFM_CITY = 'ct';

export default class UserFieldsManager extends FieldsManager<'photo' | 'city' | 'followers' | 'isFollowing', IUser> {
    public build(session: ISession | null, tableName: string = 'user'): BuildResult {
        const joins: string[] = [];
        const columns: string[] = USER_KEYS.map(key => `${wrapIdentify(tableName)}.${wrapIdentify(key)}`);

        // fields=photo
        if (this.is(USERS_GET_FIELD_PHOTO)) {
            columns.push(...packIdentitiesToSql('photo', UFM_PHOTO, PHOTO_KEYS));
            joins.push(`left join \`photo\` on \`photo\`.\`photoId\` = \`${tableName}\`.\`photoId\``);
        }

        // fields=city
        if (this.is(USERS_GET_FIELD_CITY)) {
            columns.push(...packIdentitiesToSql('city', UFM_CITY, CITY_KEYS));
            joins.push(`left join \`city\` on \`city\`.\`cityId\` = \`${tableName}\`.\`cityId\``);
        }

        // fields=followers
        if (this.is(USERS_GET_FIELD_FOLLOWERS)) {
            columns.push(`getUserFollowersCount(\`${tableName}\`.\`userId\`) as \`followers\``);
        }

        // fields=isFollowing
        if (this.is(USERS_GET_FIELD_IS_FOLLOWING) && session !== null) {
            columns.push(`isUserFollowed(${session.userId}, \`${tableName}\`.\`userId\`) as \`isFollowed\``);
        }

        return {
            joins: joins.join(' '),
            columns: columns.join(', '),
        };
    }

    public handleResult = (user: IUser): IUser => {
        if (this.is(USERS_GET_FIELD_PHOTO)) {
            const photo = unpackObject<IUser, IPhotoRaw>(user, UFM_PHOTO, PHOTO_KEYS);

            user.photo = photo.photoId
                ? raw2object(photo)
                : null;
        }

        if (this.is(USERS_GET_FIELD_CITY)) {
            const city = unpackObject<IUser, ICity>(user, UFM_CITY, CITY_KEYS);

            user.city = city.cityId ? city : null;
        }

        if (this.is(USERS_GET_FIELD_IS_FOLLOWING) && 'isFollowed' in user) {
            user.isFollowed = Boolean(user.isFollowed);
        }

        return user;
    }
}