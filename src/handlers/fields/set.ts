import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { toNumber } from '../../utils/to-number';
import { ISightField } from '../../types/field';
import findDifferenceFields from '../../utils/fields/find-diffs';

type IParams = {
    sightId: number;
    details: Record<string, string>;
};

type IResult = boolean;

export default class FieldsSet extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParams {
        const sightId = toNumber(params.sightId as string);

        if (!sightId) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Sight id not specified');
        }

        const details = JSON.parse(params.details as string);

        return { sightId, details };
    }

    protected async perform({ sightId, details }: IParams, props: ICallPropsOpen): Promise<IResult> {
        const current = (await props.callMethod<ISightField[]>('fields.getOfSight', { sightId }))
            .reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {} as Record<string, string>);

        const { added, modified, removed } = findDifferenceFields(current, details);

        for (const key of added) {
            await props.database.apply(
                'insert into `sightField` (`sightId`, `name`, `value`) values (?, ?, ?)',
                [sightId, key, details[key]],
            );
        }

        for (const key of modified) {
            await props.database.apply(
                'update `sightField` set `value` = ? where `sightId` = ? and `name` = ?',
                [details[key], sightId, key],
            );
        }

        for (const key of removed) {
            await props.database.apply(
                'delete from `sightField` where `sightId` = ? and `name` = ?',
                [sightId, key],
            );
        }

        return true;
    }
}
