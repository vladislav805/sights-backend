import SightFieldsManager from '../../utils/sights/sight-fields-manager';
import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { toBoolean } from '../../utils/to-boolean';
import { IUser } from '../../types/user';
import { getUsers } from '../../utils/users/get-users';
import { UnspecifiedParamError } from '../../error';
import { SIGHTS_GET_FIELD_FIELDS } from './keys';
import { toTheString } from '../../utils/to-string';

type IParams = {
    sightIds: number[];
    fields: SightFieldsManager;
    extended: boolean;
    fieldsStr: string;
};

type IResult = {
    items: ISight[];
    users?: IUser[];
};

export default class SightsGetById extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const sightIds = paramToArrayOf(params.sightIds, Number);

        if (!sightIds || !sightIds.length) {
            throw new UnspecifiedParamError('sightIds');
        }

        const extended = toBoolean(params.extended);
        const fields = toTheString(params.fields, true);
        return {
            sightIds,
            fields: new SightFieldsManager(fields),
            extended,
            fieldsStr: extended ? fields : '',
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IResult> {
        const { columns, joins } = params.fields.build(companion.session);

        const result = await companion.database.select<ISight>(
            `select \`pl\`.*, ${columns} from \`place\` \`pl\` ${joins} where \`sight\`.\`sightId\` in (?) `,
            [params.sightIds],
        );

        let users: IUser[] | undefined = undefined;

        if (params.extended) {
            users = await getUsers(result.map(sight => sight.ownerId), params.fieldsStr, companion);
        }

        if (result.length === 1 && params.fields.is(SIGHTS_GET_FIELD_FIELDS)) {
            result[0].fields = await companion.callMethod('sights.getFieldsOfSight', {
                sightId: params.sightIds,
            });
        }

        return {
            items: result.map(params.fields.handleResult),
            users,
        };
    }
}
