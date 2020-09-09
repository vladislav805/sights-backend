import * as crypto from 'crypto';
import { getConfigValue } from '../../config';
import { time } from '../time';

const salt = getConfigValue<string>('SALT_AUTH_KEY');

export const createAuthKey = (userId: number): string => crypto.createHash('sha512')
    .update(`${salt}${userId}${time()}`)
    .digest('hex');
