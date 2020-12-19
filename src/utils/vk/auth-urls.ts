import config from '../../config';

export const getVkClientAuthorize = () => `https://oauth.vk.com/authorize?client_id=${config.ThirdParty.VK.CLIENT_ID}&display=page&redirect_uri=${config.ThirdParty.VK.REDIRECT_URI}&scope=4194304&response_type=code&v=${config.ThirdParty.VK.API_VERSION}`;
