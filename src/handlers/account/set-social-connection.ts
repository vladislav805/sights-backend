import { ICompanion, PrivateMethodAPI } from '../method';
import { ISession } from '../../types/session';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { ITelegramAuthResult } from '../../utils/telegram/types';
import { IVkAuthResult } from '../../utils/vk/types';
import { setSocial, SocialType } from '../../utils/account/set-social';
import { toTheString } from '../../utils/to-string';

type IParamsTelegram = {
    social: 'telegram';
    data: ITelegramAuthResult;
};

type IParamsVk = {
    social: 'vk';
    data: IVkAuthResult;
};

type IParams = IParamsTelegram | IParamsVk;

type IResult = boolean;

export default class AccountSetSocialConnections extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, companion: ICompanion): IParams {
        const social = toTheString(params.social, null, 'social');
        const data = toTheString(params.data, null, 'data');

        if (social !== 'telegram' && social !== 'vk') {
            throw new ApiError(ErrorCode.UNKNOWN_SOCIAL);
        }

        return {
            social: social as SocialType,
            data: JSON.parse(data),
        };
    }

    protected async perform(params: IParams, companion: ICompanion<ISession>): Promise<IResult> {
        return setSocial(companion, params.social, params.data);
    }
}
