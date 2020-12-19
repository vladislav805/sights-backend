import fetch from 'node-fetch';
import * as qs from 'querystring';
import config from '../../config';

type IVkSession = {
    access_token: string;
};

export const getVkToken = async(code: string): Promise<IVkSession> => {
    const queryString = qs.stringify({
        client_id: config.ThirdParty.VK.CLIENT_ID,
        client_secret: config.ThirdParty.VK.CLIENT_SECRET,
        redirect_uri: config.ThirdParty.VK.REDIRECT_URI,
        code,
    });
    const url = `https://oauth.vk.com/access_token?${queryString}`;
    const response = await fetch(url);
    const json = await response.json();

    return json as IVkSession;
};
