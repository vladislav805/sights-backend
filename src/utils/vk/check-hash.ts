import { createHash } from 'crypto';
import { IVkAuthResult } from './types';
import config from '../../config';

export const checkVkHash = ({ hash, uid }: IVkAuthResult) => {
    const checkString = `${config.ThirdParty.VK.CLIENT_ID}${uid}${config.ThirdParty.VK.CLIENT_SECRET}`;
    const hmac = createHash('md5')
        .update(checkString)
        .digest('hex');
    return hmac === hash;
};
