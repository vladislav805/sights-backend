import config from '../../config';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

export type IReCaptchaResult = {
    success: boolean;
};

export const reCaptchaCheck = async(response: string): Promise<IReCaptchaResult> => {
    const result = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: new URLSearchParams({
            secret: config.ThirdParty.ReCaptcha.SECRET,
            response,
        }),
    });

    // noinspection ES6MissingAwait
    return result.json() as Promise<IReCaptchaResult>;
};
