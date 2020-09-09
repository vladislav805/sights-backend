import { getConfigValue } from '../../config';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

const RECAPTCHA_SECRET = getConfigValue('GOOGLE_RECAPTCHA_SECRET_TOKEN');

export type IReCaptchaResult = {
    success: boolean;
};

export const reCaptchaCheck = async(response: string): Promise<IReCaptchaResult> => {
    const result = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: new URLSearchParams({
            secret: RECAPTCHA_SECRET,
            response,
        }),
    });

    const json = await result.json() as IReCaptchaResult;

    return json;
};
