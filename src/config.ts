import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({
    path: path.resolve('..', '.env'),
});

function getConfigValue<T extends string | number = string>(name: string): T {
    return process.env[name] as T;
}

const secret = {
    UPLOAD_UPLOAD: getConfigValue('SECRET_UPLOAD'),
    UPLOAD_SAVE: getConfigValue('SECRET_SAVE'),
    UPLOAD_REMOVE: getConfigValue('SECRET_REMOVE'),
    EMAIL_LOGIN: getConfigValue('EMAIL_LOGIN'),
    EMAIL_PASSWORD: getConfigValue('EMAIL_PASSWORD'),
};

const salt = {
    /**
     * Используется при создании авторизационной сессии
     */
    AUTH_KEY: getConfigValue('SALT_AUTH_KEY'),

    /**
     * Используется при хэшировании пароля
     */
    PASSWORD: getConfigValue('SALT_PASSWORD'),
};

const domain = {
    /**
     * Основной домен сайта
     */
    MAIN: getConfigValue('DOMAIN_MAIN'),

    /**
     * Домен со статикой (пользовательскими фотографиями)
     */
    MEDIA: getConfigValue('DOMAIN_MEDIA'),
};

const PORT_MAIN = +getConfigValue<number>('PORT_MAIN');
const PORT_MEDIA = +getConfigValue<number>('PORT_MEDIA');

const db = {
    host: getConfigValue<string>('DATABASE_HOST'),
    user: getConfigValue<string>('DATABASE_USER'),
    password: getConfigValue<string>('DATABASE_PASSWORD'),
    database: getConfigValue<string>('DATABASE_NAME'),
};

const ThirdParty = {
    VK: {
        CLIENT_ID: getConfigValue<number>('VK_CLIENT_ID'),
        CLIENT_SECRET: getConfigValue<string>('VK_CLIENT_SECRET'),
        REDIRECT_URI: getConfigValue<string>('VK_REDIRECT_URI'),
        API_VERSION: getConfigValue<string>('VK_API_VERSION'),
    },
    Telegram: {
        TOKEN: getConfigValue<string>('TELEGRAM_BOT_TOKEN'),
    },
    ReCaptcha: {
        SECRET: getConfigValue<string>('GOOGLE_RECAPTCHA_SECRET_TOKEN'),
    },
};

const config = {
    secret,
    domain,
    db,
    salt,
    PORT_MAIN,
    PORT_MEDIA,
    ThirdParty,
};

export default config;
