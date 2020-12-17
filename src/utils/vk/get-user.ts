import { VKAPIClient } from '@apidog/vk-client/dist/client';
import { IUser as IVkUser } from '@apidog/vk-typings';

export const getVkUser = (token: string): Promise<IVkUser> => {
    return new VKAPIClient(token, {
        v: '5.122',
    }).perform<IVkUser>('execute.getInfo', {});
};
