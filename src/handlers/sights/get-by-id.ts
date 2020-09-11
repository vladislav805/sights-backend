import SightFieldsManager from '../../utils/sights/sight-fields-manager';
import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { toBoolean } from '../../utils/to-boolean';
import { IUser } from '../../types/user';
import { getUsers } from '../../utils/users/get-users';

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
    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParams {
        const extended = toBoolean(params.extended);
        return {
            sightIds: paramToArrayOf(params.sightIds as string, Number),
            fields: new SightFieldsManager(params.fields as string),
            extended,
            fieldsStr: extended ? params.fields as string : '',
        };
    }

    protected async perform(params: IParams, props: ICallPropsOpen): Promise<IResult> {
        const { columns, joins } = params.fields.build(props.session);

        // noinspection SqlResolve
        const result = await props.database.select<ISight>(
            `select ${columns} from \`place\` ${joins} where \`sight\`.\`sightId\` in (?) `,
            [params.sightIds],
        );

        let users: IUser[] | undefined = undefined;

        if (params.extended) {
            users = await getUsers(result.map(sight => sight.ownerId), params.fieldsStr, props.session);
        }

        return {
            items: result.map(params.fields.handleResult),
            users,
        };
    }
}
