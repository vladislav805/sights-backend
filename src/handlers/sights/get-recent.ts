import { ICompanion, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import SightFieldsManager from '../../utils/sights/sight-fields-manager';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';

type IParams = {
    count: number;
    fields: SightFieldsManager;
};

type IResponse = IApiList<ISight>;

export default class SightsGetRecent extends OpenMethodAPI<IParams, IResponse> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            count: clamp(toNumber(params.count, 20), 1, 50),
            fields: new SightFieldsManager(params.fields as string),
        };
    }

    protected async perform({
        count,
        fields,
    }: IParams, {
        database,
        session,
    }: ICompanion): Promise<IResponse> {
        const { columns, joins } = fields.build(session);

        const items = await database.select<ISight>(
            `select \`pl\`.*, ${columns} from \`place\` \`pl\` ${joins} order by \`sight\`.\`sightId\` desc limit ?`,
            [count],
        );

        return {
            count: items.length,
            items: items.map(fields.handleResult),
        };
    }
}
