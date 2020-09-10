import { resolve } from 'path';
import config from '../config';

export const getFullFilePath = (path: string, name: string): string => resolve(config.directory.permanent, path, name);
