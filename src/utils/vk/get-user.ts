import { IUser as IVkUser } from '@apidog/vk-typings';
import VKAPIClient from '@apidog/vk-client';

export const getVkUser = (token: string): Promise<IVkUser> => {
    return new VKAPIClient(token, {
        v: '5.122',
    }).perform<IVkUser>('execute.getInfo', {});
};
