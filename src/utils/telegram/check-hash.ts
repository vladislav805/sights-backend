import { createHash, createHmac } from 'crypto';
import { ITelegramAuthResult } from './types';
import config from '../../config';

export const checkTelegramHash = ({ hash, ...data }: ITelegramAuthResult) => {
    const secret = createHash('sha256')
        .update(config.ThirdParty.Telegram.TOKEN)
        .digest();
    const checkString = Object.keys(data)
        .sort()
        .map(k => `${k}=${data[k]}`)
        .join('\n')
    const hmac = createHmac('sha256', secret)
        .update(checkString)
        .digest('hex')
    return hmac === hash;
};
