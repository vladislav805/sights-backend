import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ICity } from '../../types/city';
import { build, ICityRaw } from './keys';

type IParams = {
    count: number; // = 50
    offset: number; // = 0
    all: boolean; // = false
    extended: boolean; // = false
};

export default class CitiesGet extends OpenMethodAPI<IParams, IApiList<ICity>> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            count: +params.count || 50,
            offset: params.offset ? +params.offset : 0,
            all: 'all' in params && Boolean(params.all),
            extended: 'extended' in params && Boolean(params.extended),
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
