import { createHash, createHmac } from 'crypto';
import { ITelegramAuthResult } from './types';
import { getConfigValue } from '../../config';

const BOT_TOKEN = getConfigValue<string>('TELEGRAM_BOT_TOKEN');

export const checkTelegramHash = ({ hash, ...data }: ITelegramAuthResult) => {
    const secret = createHash('sha256')
        .update(BOT_TOKEN)
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
