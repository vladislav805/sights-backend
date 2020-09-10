import { packIdentitiesToSql, unpackObject, wrapIdentify } from '../sql-packer-id';
import { PHOTO_KEYS } from '../../handlers/photos/keys';
import { CITY_KEYS } from '../../handlers/cities/keys';
import { IPhotoRaw } from '../../types/photo';
import raw2object from '../photos/raw-to-object';
import { ICity } from '../../types/city';
import { BuildResult, FieldsManager } from '../fields-manager';
import { ISession } from '../../types/session';
import { ISight } from '../../types/sight';
import { Filter, SIGHT_KEYS, SIGHTS_GET_FIELD_CITY, SIGHTS_GET_FIELD_PHOTO, SIGHTS_GET_FIELD_TAGS, SIGHTS_GET_FIELDS_ALLOWED } from '../../handlers/sights/keys';
import { CATEGORY_KEYS } from '../../handlers/categories/keys';
import { isBit } from '../is-bit';
import { ICategory } from '../../types/category';

const SFM_CATEGORY = 'cg';
const SFM_PHOTO = 'pt';
const SFM_CITY = 'ct';

export default class SightFieldsManager extends FieldsManager<'photo' | 'city' | 'tags', ISight> {
    private filter: number;

    public constructor(fields: string) {
        super(fields, SIGHTS_GET_FIELDS_ALLOWED);
    }

    public setFilter(filter: number): this {
        this.filter = filter;
        return this;
    }

    public build(session: ISession | null, tableName: string = 'sight'): BuildResult {
        const joins: string[] = [
            'left join `sight` on `place`.`placeId` = `sight`.`placeId`',
            'left join `category` on `category`.`categoryId` = `sight`.`categoryId`',
        ];
        const columns: string[] = SIGHT_KEYS.map(key => `${wrapIdentify(tableName)}.${wrapIdentify(key)}`);

        columns.push(...packIdentitiesToSql('category', SFM_CATEGORY, CATEGORY_KEYS));

        // Есть ли фильтр по фоткам или запрашивается ли фотка, тогда нужно join'ить таблицы с фотками
        const photoFilter = isBit(this.filter, Filter.WITH_PHOTO) || isBit(this.filter, Filter.WITHOUT_PHOTO);
        const needJoinPhoto = this.is(SIGHTS_GET_FIELD_PHOTO) || photoFilter;

        // fields=city
        if (this.is(SIGHTS_GET_FIELD_CITY)) {
            columns.push(...packIdentitiesToSql('city', SFM_CITY, CITY_KEYS));
            joins.push(`left join \`city\` on \`city\`.\`cityId\` = \`${tableName}\`.\`cityId\``);
        }

        if (needJoinPhoto) {
            joins.push('left join `sightPhoto` on `sightPhoto`.`sightId` = `sight`.`sightId`');
            joins.push('left join `photo` as `p` on `sightPhoto`.`photoId` = `p`.`photoId`');

            if (this.is(SIGHTS_GET_FIELD_PHOTO)) {
                columns.push(...packIdentitiesToSql('p', SFM_PHOTO, PHOTO_KEYS));
            }
        }

        if (this.is(SIGHTS_GET_FIELD_TAGS)) {
            columns.push('group_concat(distinct `sightTag`.`tagId`) as `t_tagIds`');
            joins.push('left join `sightTag` on `sightTag`.`sightId` = `sight`.`sightId`');
        }

        return {
            joins: joins.join(' '),
            columns: columns.join(', '),
        };
    }

    public handleResult = (sight: ISight): ISight => {
        const category = unpackObject<ISight, ICategory>(sight, SFM_CATEGORY, CATEGORY_KEYS);

        sight.category = sight.categoryId ? category : null;

        if (this.is(SIGHTS_GET_FIELD_PHOTO)) {
            const photo = unpackObject<ISight, IPhotoRaw>(sight, SFM_PHOTO, PHOTO_KEYS);

            sight.photo = photo.photoId
                ? raw2object(photo)
                : null;
        }

        if (this.is(SIGHTS_GET_FIELD_CITY)) {
            const city = unpackObject<ISight, ICity>(sight, SFM_CITY, CITY_KEYS);

            sight.city = city.cityId ? city : null;
        }

        if (this.is(SIGHTS_GET_FIELD_TAGS)) {
            console.log(sight)
            const { tagIds = '' } = unpackObject<ISight, { tagIds: string }>(sight, 't', ['tagIds']);
            console.log(sight, tagIds)
            sight.tags = (tagIds || '').split(',').map(Number).filter(Boolean);
        }

        return sight;
    }
}
