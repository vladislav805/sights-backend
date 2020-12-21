import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ICity } from '../../types/city';
import { CITY_KEYS } from './keys';
import { paramToArrayOf } from '../../utils/param-to-array-of';

type IParams = {
    cityIds: number[]; // required
    extended: boolean; // = false
};

export default class CitiesGetById extends OpenMethodAPI<IParams, ICity[]> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            cityIds: paramToArrayOf(params.cityIds as string, Number),
            extended: 'extended' in params && Boolean(params.extended),
        };
    }

    protected async perform({ cityIds, extended }: IParams, { database }: ICompanion): Promise<ICity[]> {
        const returnFields = extended
            ? '*'
            : '`' + CITY_KEYS.join('`, `') + '`';

        // безопасно, потому что в handleParams мы обрабатываем все значения в cityIds в Number()
        return database.select<ICity>(`select ${returnFields} from \`city\` where \`cityId\` in (${cityIds}) `);
    }
}
