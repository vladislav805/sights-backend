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

type IResultStat = {
    visited: number;
    desired: number;
};

type IResult = {
    state: boolean;
    stat: IResultStat;
};

const STATE_MSG = 'Invalid state value, allowed values: 0, 1, 2';

export default class SightsSetVisitState extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const state = toNumber(params.state, STATE_MSG);

        if (!isValidVisitState(state)) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, STATE_MSG);
        }

        return {
            sightId: toNumber(params.sightId, 'Invalid sightId'),
            state,
        };
    }

    protected async perform({ sightId, state }: IParams, companion: ICompanionPrivate): Promise<IResult> {
        // проверка на то, что оно вообще существует
        await getSightById(companion.database, sightId);

        let dbResult: IDatabaseApplyQuery;
        let result: boolean;

        if (state !== VisitState.NOT_VISITED) {
            dbResult = await companion.database.apply(
                'insert into `sightVisit` (`sightId`, `userId`, `state`) values (?, ?, ?) on duplicate key update `state` = ?',
                [sightId, companion.session.userId, state, state],
            );

            result = dbResult.insertId > 0;
        } else {
            dbResult = await companion.database.apply(
                'delete from `sightVisit` where `sightId` = ? and `userId` = ?',
                [sightId, companion.session.userId],
            );

            result = dbResult.affectedRows > 0;
        }

        const stat = await companion.callMethod<IResultStat>('sights.getVisitStat', { sightId });

        return {
            state: result,
            stat,
        };
    }
}
