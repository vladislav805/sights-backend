import { ICompanionPrivate, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import getSightById from '../../utils/sights/get-sight';
import { sendTelegramMessage } from '../../utils/telegram/send-message';
import config from '../../config';

type IParams = {
    sightId: number;
};

export default class SightsReport extends OpenMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        return {
            sightId: toNumber(params.sightId, 'sightId'),
        };
    }

    protected async perform(params: IParams, props: ICompanionPrivate): Promise<boolean> {
        await getSightById(props.database, params.sightId)
            .then(sight => sendTelegramMessage(`**Жалоба на достопримечательность**:\n\nhttps://${config.domain.MAIN}/sight/${sight.sightId}`));

        return true;
    }
}
