import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ICity } from '../../types/city';
import { build, ICityRaw } from './keys';
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
        const { columns, joins, handleItem } = build(extended, true);

        // безопасно, потому что в handleParams мы обрабатываем все значения в cityIds в Number()
        const items = await database.select<ICityRaw>(`select ${columns} from \`city\` ${joins} where \`city\`.\`cityId\` in (${cityIds}) `);

        return items.map(handleItem);
    }
}
