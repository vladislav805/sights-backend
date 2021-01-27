import { packIdentitiesToSql, unpackObject, wrapIdentify } from '../sql-packer-id';
import { CITY_KEYS } from '../../handlers/cities/keys';
import { ICity } from '../../types/city';
import { BuildResult, FieldsManager } from '../fields-manager';
import { ISession } from '../../types/session';
import {
    COLLECTION_FIELD_CITY,
    COLLECTION_FIELD_RATING,
    COLLECTION_FIELDS_ALLOWED,
    COLLECTION_KEYS,
} from '../../handlers/collections/keys';
import { ICollection, ICollectionRating } from '../../types/collection';

const CFM_CITY = 'ct';
const CFM_RATING = 'rg';

export default class CollectionFieldsManager extends FieldsManager</*'collection_tags' | */ 'collection_city' | 'collection_rating', ICollection> {
    private session: ISession | null;

    public constructor(fields: string) {
        super(fields, COLLECTION_FIELDS_ALLOWED);
    }

    public build(session: ISession | null, tableName: string = 'collection'): BuildResult {
        const joins: string[] = [];
        const columns: string[] = COLLECTION_KEYS.map(key => `${wrapIdentify(tableName)}.${wrapIdentify(key)}`);

        this.session = session;

        // fields=collection_city
        if (this.is(COLLECTION_FIELD_CITY)) {
            columns.push(...packIdentitiesToSql('city', CFM_CITY, CITY_KEYS));
            joins.push(`left join \`city\` on \`city\`.\`cityId\` = \`${tableName}\`.\`cityId\``);
        }

        // fields=collection_rating
        if (this.is(COLLECTION_FIELD_RATING)) {
            columns.push('`collection`.`rating` as `' + CFM_RATING + '_value`');
            columns.push('(select count(*) from `rating` where `rating`.`collectionId` = `collection`.`collectionId`) as `' + CFM_RATING + '_count`');
            if (!!session) {
                columns.push('`rs`.`rate` as `' + CFM_RATING + '_rated`');
                joins.push('left join `rating` `rs` on `rs`.`collectionId` = `collection`.`collectionId` and `rs`.`userId` = ' + session.userId);
            }
        }

        return {
            joins: joins.join(' '),
            columns: columns.join(', '),
        };
    }

    public handleResult = <T extends ICollection>(collection: T): T => {
        if (this.is(COLLECTION_FIELD_CITY)) {
            const city = unpackObject<ICollection, ICity>(collection, CFM_CITY, CITY_KEYS);

            collection.city = city.cityId ? city : null;
        }

        if (this.is(COLLECTION_FIELD_RATING)) {
            collection.rating = unpackObject<ICollection, ICollectionRating>(collection, CFM_RATING, ['rated', 'value', 'count']);
        }

        return collection;
    }
}
