import { ApiParam } from '../types/api';
import { ApiError, ErrorCode } from '../error';

function toTheString(value: ApiParam): string;
function toTheString(value: ApiParam, defaultValue?: string): string;
function toTheString(value: ApiParam, silent?: boolean): string;
function toTheString(value: ApiParam, defaultValue?: string | null, fieldName?: string): string;
function toTheString(value: ApiParam, defaultValue?: string | null | boolean, fieldName?: string): string {
    const str = String(value).trim();

    if (!str.length || value === undefined || value === null) {
        if (typeof defaultValue === 'boolean' && defaultValue) {
            return str;
        }

        if (typeof defaultValue === 'string') {
            return defaultValue;
        }

        throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, `Missed value for parameter "${fieldName}"`);
    }

    return str;
}

export { toTheString };
