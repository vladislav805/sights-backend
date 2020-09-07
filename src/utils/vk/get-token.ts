import fetch from 'node-fetch';
import * as qs from 'querystring';
import { VK_CLIENT_ID, VK_CLIENT_SECRET, VK_REDIRECT_URI } from './common';

type IVkSession = {
    access_token: string;
};

export const getVkToken = async(code: string): Promise<IVkSession> => {
    const queryString = qs.stringify({
        client_id: VK_CLIENT_ID,
        client_secret: VK_CLIENT_SECRET,
        redirect_uri: VK_REDIRECT_URI,
        code,
    });
    const url = `https://oauth.vk.com/access_token?${queryString}`;
    const response = await fetch(url);
    const json = await response.json();

    return json as IVkSession;
};
