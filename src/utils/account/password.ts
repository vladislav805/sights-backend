import * as crypto from 'crypto';
import { getConfigValue } from '../../config';

const salt = getConfigValue<string>('SALT_PASSWORD');

export const hashPassword = (str: string): string => crypto.createHash('sha512')
    .update(`${str}${salt}`)
    .digest('hex');
