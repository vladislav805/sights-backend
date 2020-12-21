import { packIdentitiesToSql, unpackObject, wrapIdentify } from '../sql-packer-id';
import { PHOTO_KEYS } from '../../handlers/photos/keys';
import { CITY_KEYS } from '../../handlers/cities/keys';
import { IPhotoRaw } from '../../types/photo';
import raw2object from '../photos/raw-to-object';
import { ICity } from '../../types/city';
import { BuildResult, FieldsManager } from '../fields-manager';
import { ISession } from '../../types/session';
import { ISight, ISightRating } from '../../types/sight';
import {
    Filter,
    SIGHT_KEYS,
    SIGHTS_GET_FIELD_CITY,
    SIGHTS_GET_FIELD_PHOTO,
    SIGHTS_GET_FIELD_RATING,
    SIGHTS_GET_FIELD_TAGS,
    SIGHTS_GET_FIELD_VISIT_STATE,
    SIGHTS_GET_FIELDS_ALLOWED,
} from '../../handlers/sights/keys';
import { CATEGORY_KEYS } from '../../handlers/categories/keys';
import { isBit } from '../is-bit';
import { ICategory } from '../../types/category';

const SFM_CATEGORY = 'cg';
const SFM_PHOTO = 'pt';
const SFM_CITY = 'ct';
const SFM_RATING = 'rg';

export default class SightFieldsManager extends FieldsManager<'photo' | 'city' | 'tags' | 'visitState' | 'rating' | 'fields', ISight> {
    private filter: number = 0;
    private session: ISession | null;

    public constructor(fields: string) {
        super(fields, SIGHTS_GET_FIELDS_ALLOWED);
    }

    public setFilter(filter: number): this {
        this.filter = filter;
        return this;
    }

    public build(session: ISession | null, tableName: string = 'sight'): BuildResult {
        const joins: string[] = [
            `left join \`sight\` on \`pl\`.\`placeId\` = \`sight\`.\`placeId\``,
            `left join \`category\` on \`category\`.\`categoryId\` = \`sight\`.\`categoryId\``,
        ];
        const columns: string[] = SIGHT_KEYS.map(key => `${wrapIdentify(tableName)}.${wrapIdentify(key)}`);

        columns.push(...packIdentitiesToSql('category', SFM_CATEGORY, CATEGORY_KEYS));

        this.session = session;

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
            joins.push('left join `photo` `p` on `sightPhoto`.`photoId` = `p`.`photoId`');

            if (this.is(SIGHTS_GET_FIELD_PHOTO)) {
                columns.push(...packIdentitiesToSql('p', SFM_PHOTO, PHOTO_KEYS));
            }
        }

        if (this.is(SIGHTS_GET_FIELD_TAGS)) {
            columns.push('group_concat(distinct `sightTag`.`tagId`) as `t_tagIds`');
            joins.push('left join `sightTag` on `sightTag`.`sightId` = `sight`.`sightId`');
        }

        if (this.is(SIGHTS_GET_FIELD_VISIT_STATE) && !!session) {
            columns.push('ifnull(`sightVisit`.`state`, 0) as `visitState`');
            joins.push('left join `sightVisit` on `sightVisit`.`sightId` = `sight`.`sightId` and `sightVisit`.`userId` = ' + session.userId);
        }

        if (this.is(SIGHTS_GET_FIELD_RATING)) {
            joins.push('left join `rating` `ra` on `ra`.`sightId` = `sight`.`sightId`');
            columns.push('`sight`.`rating` as `' + SFM_RATING + '_value`');
            columns.push('count(`ra`.`rate`) as `' + SFM_RATING + '_count`');
            if (!!session) {
                columns.push('`rs`.`rate` as `' + SFM_RATING + '_rated`');
                joins.push('left join `rating` `rs` on `rs`.`sightId` = `sight`.`sightId` and `rs`.`userId` = ' + session.userId);
            }
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
            const { tagIds = '' } = unpackObject<ISight, { tagIds: string }>(sight, 't', ['tagIds']);
            sight.tags = (tagIds || '').split(',').map(Number).filter(Boolean);
        }

        if (this.is(SIGHTS_GET_FIELD_RATING)) {
            sight.rating = unpackObject<ISight, ISightRating>(sight, SFM_RATING, ['rated', 'value', 'count']);
        }

        const session = this.session;
        sight.canModify = !!session && (session.userId === sight.ownerId || session.user?.status === 'ADMIN');

        return sight;
    }
}
