import { ApiParam } from '../types/api';

export const toBoolean = (val: ApiParam): boolean => typeof val !== 'undefined' && !!val && (typeof val === 'number' && val > 0 || val !== '0' && val !== 'false');
