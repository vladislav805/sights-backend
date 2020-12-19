import * as crypto from 'crypto';
import config from '../../config';

export const hashPassword = (str: string): string => crypto
    .createHash('sha512')
    .update(`${str}${config.salt.PASSWORD}`)
    .digest('hex');
