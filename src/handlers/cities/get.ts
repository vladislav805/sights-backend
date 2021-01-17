import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ICity } from '../../types/city';
import { build, ICityRaw } from './keys';
import { toBoolean } from '../../utils/to-boolean';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';

type IParams = {
    count: number; // = 50
    offset: number; // = 0
    all: boolean; // = false
    extended: boolean; // = false
};

export default class CitiesGet extends OpenMethodAPI<IParams, IApiList<ICity>> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            count: clamp(toNumber(params.count, 50), 1, 1000),
            offset: toNumber(params.offset, 0),
            all: toBoolean(params.all),
            extended: toBoolean(params.extended),
        };
    }

    protected async perform({ count, offset, extended, all }: IParams, { database }: ICompanion): Promise<IApiList<ICity>> {
        const { columns, joins, handleItem } = build(extended, all);

        const filterWhere: string[] = [];

        if (!all) {
            filterWhere.push('`city`.`parentId` is null');
        }

        const where = filterWhere.length
            ? ' where ' + filterWhere.join(' and ')
            : '';

        const allCount = await database.count(`select count(*) as \`count\` from \`city\` ${where}`);
        const items = await database.select<ICityRaw>(
            `select ${columns} from \`city\` ${joins} ${where} limit ?, ?`,
            [offset, count],
        );

        return {
            count: allCount,
            items: items.map(handleItem),
        };
    }
}
