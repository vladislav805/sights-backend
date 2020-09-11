import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { ApiParam, IApiList, IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';
import SightFieldsManager from '../../utils/sights/sight-fields-manager';

type Sort = 'asc' | 'desc';
const SORT: Sort[] = ['desc', 'asc'];

type IParams = {
    ownerId: number;
    fields: SightFieldsManager;
    sort: Sort;
    count: number;
    offset: number;
};

const isValidSort = (str: ApiParam): str is Sort => SORT.includes(str as Sort);

export default class SightsGet extends OpenMethodAPI<IParams, IApiList<ISight>> {
    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParams {
        console.log(params.count);
        return {
            ownerId: toNumber(params.ownerId),
            sort: isValidSort(params.sort) ? params.sort : SORT[0],
            fields: new SightFieldsManager(params.fields as string),
            count: clamp(toNumber(params.count, 50), 1, 100),
            offset: toNumber(params.offset, 0),
        };
    }

    protected async perform({ ownerId, fields, sort, count: limit, offset }: IParams, props: ICallPropsOpen): Promise<IApiList<ISight>> {
        const { columns, joins } = fields.build(props.session);

        const count = await props.database.count(
            'select count(*) as `count` from `sight` where `ownerId` = ?',
            [ownerId],
        );

        // noinspection SqlResolve
        const result = await props.database.select<ISight>(
            `select ${columns} from \`place\` ${joins} where \`sight\`.\`ownerId\` = ? order by \`sightId\` ${sort} limit ?, ?`,
            [ownerId, offset, limit],
        );

        return {
            count,
            items: result.map(fields.handleResult),
        };
    }
}
