import * as path from 'path';
import { config } from 'dotenv';
import { SiteConfig } from './types/config';

let configContents: SiteConfig;

export const getConfigValue = <T extends string | number = string>(name: string): T => {
    return process.env[name] as T;
};

export const loadConfig = () => config({
    path: path.resolve('dev.env'),
});
