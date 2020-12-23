import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { IPlace } from '../../types/place';
import { IFieldsGetParamsBase, parseAndCheckArea } from './area';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';

type IParams = IFieldsGetParamsBase;

type IResult = IApiList<IPlace>;

export default class MapGetPlaces extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const area = parseAndCheckArea(params.area as string);

        return {
            area,
            count: clamp(toNumber(params.count, 100), 1, 200),
        };
    }

    protected async perform(params: IParams, { database }: ICompanion): Promise<IResult> {
        const [[lat1, lng1], [lat2, lng2]] = params.area;
        const items = await database.select<IPlace>(
            'select * from `place` where (`place`.`latitude` between ? and ?) and (`place`.`longitude` between ? and ?) limit ?',
            [lat1, lat2, lng1, lng2, params.count],
        );

        return { items };
    }
}
