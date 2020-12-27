import { ICompanion } from '../../handlers/method';
import { ITelegramAuthResult } from '../telegram/types';
import { IVkAuthResult } from '../vk/types';
import { ISession } from '../../types/session';
import { checkTelegramHash } from '../telegram/check-hash';
import { ApiError, ErrorCode } from '../../error';
import { checkVkHash } from '../vk/check-hash';

export type Disconnect = 0;

export type SocialType = 'telegram' | 'vk';

async function setSocial(companion: ICompanion<ISession>, social: SocialType, data: ITelegramAuthResult | IVkAuthResult | Disconnect): Promise<boolean> {
    let socialUserId: number | null;

    if (data !== 0) {
        if (social === 'telegram') {
            if (!checkTelegramHash(data as ITelegramAuthResult)) {
                throw new ApiError(ErrorCode.TELEGRAM_INVALID_HASH, 'Invalid telegram hash');
            }

            socialUserId = (data as ITelegramAuthResult).id;
        } else {
            if (!checkVkHash(data as IVkAuthResult)) {
                throw new ApiError(ErrorCode.VK_INVALID_HASH, 'Invalid vk hash');
            }

            socialUserId = (data as IVkAuthResult).uid;
        }
    } else {
        socialUserId = null;
    }

    const result = await companion.database.apply(
        `update \`user\` set \`${social}Id\` = ? where \`userId\` = ? limit 1`,
        [socialUserId, companion.session.userId],
    );

    return result.affectedRows > 0;
}

export { setSocial };
