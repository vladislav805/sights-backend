import { ICompanion, PrivateMethodAPI } from '../method';
import { ISession } from '../../types/session';

type IParams = unknown;

type IResult = {
    direct: boolean;
    telegramId: number | null;
    vkId: number | null;
};

export default class AccountGetSocialConnections extends PrivateMethodAPI<IParams, IResult> {
    protected async perform(params: IParams, companion: ICompanion<ISession>): Promise<IResult> {
        type IQueryResult = {
            telegramId: number | null;
            vkId: number | null;
        };
        const [item] = await companion.database.select<IQueryResult>(
            'select `password`, `telegramId`, `vkId` from `user` where `userId` = ? limit 1',
            [companion.session.userId],
        );

        return {
            direct: !!item,
            telegramId: item.telegramId,
            vkId: item.vkId,
        };
    }
}
