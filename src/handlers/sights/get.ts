import { ICompanion, OpenMethodAPI } from '../method';
import { ApiParam, IApiList, IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';
import SightFieldsManager from '../../utils/sights/sight-fields-manager';
import { toTheString } from '../../utils/to-string';

const SORT = ['desc', 'asc'] as const;
type Sort = typeof SORT[number];

type IParams = {
    ownerId: number;
    fields: SightFieldsManager;
    sort: Sort;
    count: number;
    offset: number;
};

const isValidSort = (str: ApiParam): str is Sort => SORT.includes(str as Sort);

export default class SightsGet extends OpenMethodAPI<IParams, IApiList<ISight>> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            ownerId: toNumber(params.ownerId, 'ownerId'),
            sort: isValidSort(params.sort) ? params.sort : SORT[0],
            fields: new SightFieldsManager(toTheString(params.fields, true)),
            count: clamp(toNumber(params.count, 50), 1, 100),
            offset: toNumber(params.offset, 0),
        };
    }

    protected async perform({ ownerId, fields, sort, count: limit, offset }: IParams, props: ICompanion): Promise<IApiList<ISight>> {
        const { columns, joins } = fields.build(props.session);

        const count = await props.database.count(
            'select count(*) as `count` from `sight` where `ownerId` = ?',
            [ownerId],
        );

        const result = await props.database.select<ISight>(
            `select \`pl\`.*, ${columns} from \`place\` \`pl\` ${joins} where \`sight\`.\`ownerId\` = ? group by \`sight\`.\`sightId\` order by \`sightId\` ${sort} limit ?, ?`,
            [ownerId, offset, limit],
        );

        return {
            count,
            items: result.map(fields.handleResult),
        };
    }
}
