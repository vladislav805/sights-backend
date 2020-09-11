import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';
import SightFieldsManager from '../../utils/sights/sight-fields-manager';

type IParams = {
    ownerId: number;
    fields: SightFieldsManager;
    count: number;
    offset: number;
};

export default class SightsGet extends OpenMethodAPI<IParams, IApiList<ISight>> {
    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParams {
        return {
            ownerId: toNumber(params.ownerId),
            fields: new SightFieldsManager(params.fields as string),
            count: clamp(toNumber(params.count, 50), 1, 100),
            offset: toNumber(params.offset, 0),
        };
    }

    protected async perform({ ownerId, fields, count: limit, offset }: IParams, props: ICallPropsOpen): Promise<IApiList<ISight>> {
        const { columns, joins } = fields.build(props.session);

        const count = await props.database.count(
            'select count(*) as `count` from `sight` where `ownerId` = ?',
            [ownerId],
        );

        // noinspection SqlResolve
        const result = await props.database.select<ISight>(
            `select ${columns} from \`place\` ${joins} where \`sight\`.\`ownerId\` = ? limit ?, ?`,
            [ownerId, offset, limit],
        );

        return {
            count,
            items: result.map(fields.handleResult),
        };
    }
}
