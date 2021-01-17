import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { Sex } from '../../types/user';
import { ApiError, ErrorCode } from '../../error';
import { inRange } from '../../utils/in-range';
import { toNumber } from '../../utils/to-number';
import { wrapIdentify } from '../../utils/sql-packer-id';
import { time } from '../../utils/time';
import { isValidLogin } from '../../utils/account/is-valid-login';

type IParams = {
    firstName?: string;
    lastName?: string;
    login?: string;
    bio?: string;
    sex?: Sex;
    cityId?: number | null;
};

export default class AccountEdit extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const { firstName, lastName, login, bio, sex, cityId } = params;
        const res: IParams = {};

        if (typeof firstName === 'string') {
            if (firstName.length >= 2) {
                res.firstName = firstName;
            } else {
                throw new ApiError(ErrorCode.NAME_SHORT, 'First name so shorten');
            }
        }

        if (typeof lastName === 'string') {
            if (lastName.length >= 2) {
                res.lastName = lastName;
            } else {
                throw new ApiError(ErrorCode.NAME_SHORT, 'Last name so shorten');
            }
        }

        if (typeof login === 'string') {
            if (inRange(login.length, 4, 20) && isValidLogin(login)) {
                res.login = login;
            } else {
                throw new ApiError(ErrorCode.LOGIN_LENGTH, 'Login length will be about 4-20 symbols');
            }
        }

        if (typeof bio === 'string') {
            res.bio = bio;
        }

        if (!!sex) {
            if ([Sex.NONE, Sex.FEMALE, Sex.MALE].includes(sex as Sex)) {
                res.sex = sex as Sex;
            } else {
                throw new ApiError(ErrorCode.SEX_UNKNOWN, 'Unknown value for sex');
            }
        }

        if (!!cityId) {
            const id = toNumber(cityId, true);

            if (id !== undefined) {
                res.cityId = id;
            }
        }

        if (!Object.keys(res).length) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'No one parameter not specified');
        }

        return res;
    }

    protected async perform(params: IParams, props: ICompanionPrivate): Promise<boolean> {
        const keys = Object.keys(params) as (keyof IParams)[];
        const values = [
            ...Object.values(params),
            time(),
            props.session.userId,
        ];

        let where = '';

        if ('login' in params) {
            where = 'and `login` = ?';
            values.push(`id${props.session.userId}`);
        }

        const sets = keys.map(key => `${wrapIdentify(key)} = ?`);

        const res = await props.database.apply(
            `update \`user\` set ${sets}, \`lastSeen\` = ? where \`userId\` = ? ${where}`,
            values,
        );

        if (!res.affectedRows && 'login' in params) {
            throw new ApiError(ErrorCode.LOGIN_ALREADY_CHANGED, 'Login already changed');
        }

        return res.affectedRows > 0;
    }
}
