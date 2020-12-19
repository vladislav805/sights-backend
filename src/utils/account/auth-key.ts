import * as crypto from 'crypto';
import config from '../../config';
import { time } from '../time';

export const createAuthKey = (userId: number): string => crypto
    .createHash('sha512')
    .update(`${config.salt.AUTH_KEY}${userId}${time()}`)
    .digest('hex');
