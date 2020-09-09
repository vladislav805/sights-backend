import { getConfigValue } from '../../config';

export const VK_CLIENT_ID = getConfigValue<number>('VK_CLIENT_ID');
export const VK_CLIENT_SECRET = getConfigValue<string>('VK_CLIENT_SECRET');
export const VK_REDIRECT_URI = getConfigValue<string>('VK_REDIRECT_URI');
