import { IUser } from '../../types/user';
import { USER_KEYS, USERS_GET_FIELD_CITY, USERS_GET_FIELD_FOLLOWERS, USERS_GET_FIELD_PHOTO } from '../../handlers/users/keys';
import { packIdentitiesToSql, unpackObject } from '../sql-packer-id';
import { PHOTO_KEYS } from '../../handlers/photos/keys';
import { CITY_KEYS } from '../../handlers/cities/keys';
import { IPhotoRaw } from '../../types/photo';
import raw2object from '../photos/raw-to-object';
import { ICity } from '../../types/city';
import { BuildResult, FieldsManager } from '../fields-manager';

const UFM_PHOTO = 'pt';
const UFM_CITY = 'ct';

export default class UserFieldsManager extends FieldsManager<'photo' | 'city' | 'followers', IUser> {
    public build(): BuildResult {
        const joins: string[] = [];
        const columns: string[] = USER_KEYS.slice(0); // copy array

        // fields=photo
        if (this.is(USERS_GET_FIELD_PHOTO)) {
            columns.push(...packIdentitiesToSql('photo', UFM_PHOTO, PHOTO_KEYS));
            joins.push('left join `photo` on `photo`.`photoId` = `user`.`photoId`');
        }

        // fields=city
        if (this.is(USERS_GET_FIELD_CITY)) {
            columns.push(...packIdentitiesToSql('city', UFM_CITY, CITY_KEYS));
            joins.push('left join `city` on `city`.`cityId` = `user`.`cityId`');
        }

        // fields=followers
        if (this.is(USERS_GET_FIELD_FOLLOWERS)) {
            columns.push('getUserFollowersCount(`userId`) as `followers`');
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

        return user;
    }
}
