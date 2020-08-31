import { IMethodCallProps, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ICity } from '../../types/city';
import { CITY_KEYS } from './keys';

type IParams = {
    count: number; // = 50
    offset: number; // = 0
    all: boolean; // = false
    extended: boolean; // = false
};

export default class CitiesGet extends OpenMethodAPI<IParams, IApiList<ICity>> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
        return {
            count: +params.count || 50,
            offset: params.offset ? +params.offset : 0,
            all: 'all' in params && Boolean(params.all),
            extended: 'extended' in params && Boolean(params.extended),
        };
    }

    protected async perform({ count, offset, extended, all }: IParams, { database }: IMethodCallProps): Promise<IApiList<ICity>> {
        const returnFields = extended
            ? '*'
            : '`' + CITY_KEYS.join('`, `') + '`';
        const filterWhere: string[] = [];

        if (!all) {
            filterWhere.push('`parentId` is null');
        }

        const where = filterWhere.length
            ? ' where ' + filterWhere.join(' and ')
            : '';

        const allCount = await database.select<{ count: number }>(`select count(*) as \`count\` from \`city\` ${where}`);
        const items = await database.select<ICity>(`select ${returnFields} from \`city\` ${where} limit ${offset},${count}`);

        return {
            count: allCount[0].count,
            items,
        };
    }
}
