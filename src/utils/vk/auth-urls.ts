import { VK_CLIENT_ID, VK_REDIRECT_URI } from './common';

export const getVkClientAuthorize = () => `https://oauth.vk.com/authorize?client_id=${VK_CLIENT_ID}&display=page&redirect_uri=${VK_REDIRECT_URI}&scope=4194304&response_type=code&v=5.122`;
