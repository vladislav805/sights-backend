import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { ISight, ISightDistance } from '../../types/sight';
import SightFieldsManager from '../../utils/sights/sight-fields-manager';
import { toNumber } from '../../utils/to-number';
import { clamp } from '../../utils/clamp';

type IParams = {
    latitude: number;
    longitude: number;
    distance: number;
    count: number;
    fields: SightFieldsManager;
};

type IResponse = IApiList<ISight> & {
    distances: ISightDistance[];
};

export default class SightsGetNearby extends OpenMethodAPI<IParams, IResponse> {
    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParams {
        return {
            latitude: toNumber(params.latitude),
            longitude: toNumber(params.longitude),
            distance: clamp(toNumber(params.distance, 1000), 50, 4000),
            count: clamp(toNumber(params.count, 20), 1, 50),
            fields: new SightFieldsManager(params.fields as string),
        };
    }

    protected async perform({
        latitude,
        longitude,
        distance,
        count,
        fields,
    }: IParams, {
        database,
        session,
    }: ICallPropsOpen): Promise<IResponse> {
        const { columns, joins } = fields.build(session);

        const delta = .04;

        const sql = `select \`pl\`.*, ${columns}, floor(6371000 * acos(cos(radians(?)) * cos(radians(\`pl\`.\`latitude\`)) * cos(radians(\`pl\`.\`longitude\`) - radians(?)) + sin(radians(?)) * sin(radians(\`pl\`.\`latitude\`)))) as \`distance\` from \`place\` \`pl\` ${joins} where \`pl\`.\`latitude\` between ? and ? and \`pl\`.\`longitude\` between ? and ? group by \`sight\`.\`sightId\` having \`distance\` < ? limit ?`;

        const items = (await database.select<ISight & Partial<ISightDistance>>(sql, [
            latitude, longitude, latitude, // expr in columns
            latitude - delta, latitude + delta, longitude - delta, longitude + delta,
            distance,
            count,
        ])).sort((a, b) => a.distance! - b.distance!);

        const distances: ISightDistance[] = items.map(sight => {
            const { sightId, distance } = sight!;
            delete sight.distance;
            return { sightId, distance } as ISightDistance;
        });

        return {
            items: items.map(fields.handleResult),
            distances,
        };
    }
}
