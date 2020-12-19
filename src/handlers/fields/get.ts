import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { toNumber } from '../../utils/to-number';
import { ISightField } from '../../types/field';

type IParams = {
    sightId: number;
};

type IResult = ISightField[];

export default class FieldsGet extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParams {
        const sightId = toNumber(params.sightId as string);

        if (!sightId) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Sight id not specified');
        }

        return { sightId };
    }

    protected async perform(params: IParams, props: ICallPropsOpen): Promise<IResult> {
        return props.database.select<ISightField>(
            'select `sf`.`fieldId`, `f`.*, `sf`.`value` from `sightField` `sf` left join `field` `f` on `sf`.`name` = `f`.`name` where `sf`.`sightId` = ?',
            [params.sightId],
        );
    }
}
