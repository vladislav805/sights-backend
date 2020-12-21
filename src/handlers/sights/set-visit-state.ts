import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import getSightById from '../../utils/sights/get-sight';
import { ApiError, ErrorCode } from '../../error';
import { VisitState } from '../../types/sight';
import { isValidVisitState } from '../../utils/sights/is-valid-visit-state';
import { IDatabaseApplyQuery } from '../../database';

type IParams = {
    sightId: number;
    state: VisitState;
};

const STATE_MSG = 'Invalid state value, allowed values: 0, 1, 2';

export default class SightsSetVisitState extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const state = toNumber(params.mask, STATE_MSG);

        if (!isValidVisitState(state)) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, STATE_MSG);
        }

        return {
            sightId: toNumber(params.sightId, 'Invalid sightId'),
            state,
        };
    }

    protected async perform({ sightId, state }: IParams, props: ICompanionPrivate): Promise<boolean> {
        // проверка на то, что оно вообще существует
        await getSightById(props.database, sightId);

        let result: IDatabaseApplyQuery;

        if (state !== VisitState.NOT_VISITED) {
            result = await props.database.apply(
                'insert into `sightVisit` (`sightId`, `userId`, `state`) values (?, ?, ?) on duplicate key update `state` = ?',
                [sightId, props.session.userId, state, state],
            );

            return result.insertId > 0;
        } else {
            result = await props.database.apply(
                'delete from `sightVisit` where `sightId` = ? and `userId` = ?',
                [sightId, props.session.userId],
            );

            return result.affectedRows > 0;
        }
    }
}
