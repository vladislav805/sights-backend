import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { IFieldsGetParamsBase, parseAndCheckArea } from './area';
import { ICity } from '../../types/city';
import { build, ICityRaw } from '../cities/keys';
import { toBoolean } from '../../utils/to-boolean';
import { toNumber } from '../../utils/to-number';

type IFieldsGetCitiesParams = IFieldsGetParamsBase & {
    onlyImportant: boolean;
};

export default class MapGetCities extends OpenMethodAPI<IFieldsGetCitiesParams, IApiList<ICity>> {
    protected handleParams(params: IApiParams, props: ICompanion): IFieldsGetCitiesParams {
        const area = parseAndCheckArea(params.area as string);

        return {
            area,
            count: toNumber(params.count, 100),
            onlyImportant: toBoolean(params.onlyImportant),
        };
    }

    protected async perform(params: IFieldsGetCitiesParams, { database, session }: ICompanion): Promise<IApiList<ICity>> {
        // координаты области, которую нужно вернуть
        const [[lat1, lng1], [lat2, lng2]] = params.area;

        const { columns, joins, handleItem } = build(true, !params.onlyImportant);

        const extraWhere = params.onlyImportant
            ? 'and `parentId` is null'
            : '';

        const sql = 'select ' + columns + ', count(`sight`.`sightId`) as `count` from `city` ' + joins + 'left join `sight` on `city`.`cityId` = `sight`.`cityId` where (`city`.`latitude` between ? and ?) and (`city`.`longitude` between ? and ?) ' + extraWhere + ' group by `sight`.`cityId` limit ?';

        const items = await database.select<ICityRaw>(sql, [lat1, lat2, lng1, lng2, params.count]);

        return {
            items: items.map(handleItem),
        };
    }
}
