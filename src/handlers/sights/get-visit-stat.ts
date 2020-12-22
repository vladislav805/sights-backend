import { ICompanionPrivate, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';

type IParams = {
    sightId: number;
};

type IResult = {
    // views: number;
    visited: number;
    desired: number;
};

export default class SightsGetVisitStat extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        return {
            sightId: toNumber(params.sightId, 'Invalid sightId'),
        };
    }

    protected async perform(params: IParams, props: ICompanionPrivate): Promise<IResult> {
        const res = await props.database.select<{ count: number; state: number }>(
            'select `state`, count(`id`) as `count` from `sightVisit` where `sightId` = ? group by `state`',
            [params.sightId],
        );

        type IMap = Record<number, number>;
        const map: IMap = { 1: 0, 2: 0 };

        res.forEach(({ state, count }) => map[state] = count);

        return {
            visited: map[1],
            desired: map[2],
        };
    }
}
