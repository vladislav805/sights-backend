import { IMethodCallProps, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { packIdentitiesToSql, unpackObject } from '../../utils/sql-packer-id';
import { ICategory } from '../../types/category';
import { CATEGORY_KEYS } from '../categories/keys';

type IPointTuple = [number, number];

const enum Filter {
    ALL = 0,
    UNVERIFIED = 1,
    VERIFIED = 2,
    ARCHIVED = 4,
}

type ISightsGetParams = {
    area: [IPointTuple, IPointTuple]; // NE, SW
    filters: number;
};

export default class SightsGet extends OpenMethodAPI<ISightsGetParams, IApiList<ISight>> {
    public handleParams(params: IApiParams, props: IMethodCallProps): ISightsGetParams {
        const areaRaw = (params.area as string || '').split(';');

        if (areaRaw.length !== 2) {
            throw new Error('Supported only two points');
        }

        const area = areaRaw.map(point => {
            const coords = point.split(',');

            if (coords.length !== 2) {
                throw new Error('Unknown point format');
            }

            return coords.map(Number);
        }) as [IPointTuple, IPointTuple];

        const filters = 'filter' in params ? Number(params.filter) : 0;

        return {
            area,
            filters,
        };
    }

    public async perform(params: ISightsGetParams, props: IMethodCallProps): Promise<IApiList<ISight>> {
        const db = await this.getDatabase();

        const [[lat1, lng1], [lat2, lng2]] = params.area;

        const raw = await db.query({
            sql: '\
select \
    `place`.*, \
    `sight`.*, \
    ' + packIdentitiesToSql('category', 'ctg', CATEGORY_KEYS) + '\
from \
    `sight` \
        left join `place` on `place`.`placeId` = `sight`.`placeId` \
        left join `category` on `category`.`categoryId` = `sight`.`categoryId`\
where \
    `latitude` BETWEEN ? AND ? AND `longitude` BETWEEN ? AND ? \
limit 20',

            values: [lat1, lat2, lng1, lng2],
        });

        const items = raw.map((sight: ISight) => {
            sight.category = unpackObject<ISight, keyof ICategory, ICategory>(sight, 'ctg', CATEGORY_KEYS);
            return sight;
        });

        return { items };
    }
}
