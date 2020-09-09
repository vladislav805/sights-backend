import * as path from 'path';
import { config } from 'dotenv';

export const getConfigValue = <T extends string | number = string>(name: string): T => {
    return process.env[name] as T;
};

export const loadConfig = () => config({
    path: path.resolve(process.cwd(), 'dev.env'),
});
