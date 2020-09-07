import * as vk from '@apidog/vk-client';
import { IVkUser } from './types';

export const getVkUser = (token: string): Promise<IVkUser> => {
    return vk.VKAPIClient.getInstance(token, {
        v: '5.122',
    }).perform<IVkUser>('execute.getInfo', {});
};
