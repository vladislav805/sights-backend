import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { IUserRank } from '../../types/rank';
import { paramToArrayOf } from '../../utils/param-to-array-of';

type IParams = {
    rankIds?: number[];
};

type IResult = IUserRank[];

export default class UsersGetRanks extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            rankIds: paramToArrayOf(params.rankIds, Number),
        };
    }

    protected async perform({ rankIds }: IParams, { session, database }: ICompanion): Promise<IResult> {
        const sql = rankIds?.length
            ? `select * from \`rank\` where \`id\` in (?)`
            : 'select * from `rank`';

        const values = rankIds?.length ? [rankIds] : [];

        return database.select<IUserRank>(sql, values);
    }
}
