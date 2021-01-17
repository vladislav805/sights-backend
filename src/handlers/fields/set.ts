import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { ISightField } from '../../types/field';
import findDifferenceFields from '../../utils/fields/find-diffs';
import { toTheString } from '../../utils/to-string';

type IParams = {
    sightId: number;
    details: Record<string, string>;
};

type IResult = boolean;

export default class FieldsSet extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const sightId = toNumber(params.sightId, 'sightId');
        const details = JSON.parse(toTheString(params.details, null, 'details'));

        return { sightId, details };
    }

    protected async perform({ sightId, details }: IParams, props: ICompanion): Promise<IResult> {
        const current = (await props.callMethod<ISightField[]>('fields.get', { sightId }))
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
