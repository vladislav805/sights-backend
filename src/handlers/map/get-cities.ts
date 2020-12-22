import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { IFieldsGetParamsBase, parseAndCheckArea } from './area';
import { ICity } from '../../types/city';
import { build, ICityRaw } from '../cities/keys';
import { toBoolean } from '../../utils/to-boolean';

type IFieldsGetCitiesParams = IFieldsGetParamsBase & {
    onlyImportant: boolean;
};

export default class MapGetCities extends OpenMethodAPI<IFieldsGetCitiesParams, IApiList<ICity>> {
    protected handleParams(params: IApiParams, props: ICompanion): IFieldsGetCitiesParams {
        const area = parseAndCheckArea(params.area as string);

        return {
            area,
            onlyImportant: toBoolean(params.onlyImportant),
        };
    }

    protected async perform(params: IFieldsGetCitiesParams, { database, session }: ICompanion): Promise<IApiList<ICity>> {
        // координаты области, которую нужно вернуть
        const [[lat1, lng1], [lat2, lng2]] = params.area;

        const { columns, joins, handleItem } = build(true, !params.onlyImportant);

        const sql = 'select ' + columns + ', count(`sight`.`sightId`) as `count` from `city` ' + joins + 'left join `sight` on `city`.`cityId` = `sight`.`cityId` where (`city`.`latitude` between ? and ?) and (`city`.`longitude` between ? and ?) group by `sight`.`cityId` limit 200';

        const items = await database.select<ICityRaw>(sql, [lat1, lat2, lng1, lng2]);

        return {
            items: items.map(handleItem),
        };
    }
}
