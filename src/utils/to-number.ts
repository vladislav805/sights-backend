import { ApiParam } from '../types/api';
import { ApiError, ErrorCode } from '../error';

function toNumber(val: ApiParam): number;
function toNumber(val: ApiParam, defaultValue: number | null | undefined): number;
function toNumber(val: ApiParam, silent: boolean): number | null;
function toNumber(val: ApiParam, fieldName: string): never;
function toNumber(val: ApiParam, defaultValue: boolean | number | string | null | undefined = false): number | null {
    if (typeof val === 'undefined') {
        val = NaN;
    }

    if (typeof val === 'number' && !isNaN(val)) {
        return val;
    }

    const number = Number(val);

    if (isNaN(number) || val === null || val === undefined || typeof val === 'string' && !val.trim()) {
        if (typeof defaultValue === 'number') {
            return defaultValue;
        }

        if (defaultValue && typeof defaultValue !== 'string' || defaultValue === null) {
            return null;
        }

        throw new ApiError(
            ErrorCode.EXPECTED_NUMBER,
            typeof defaultValue === 'string'
                ? defaultValue
                : 'Expected number, found ' + typeof val,
        );
    }

    return number;
}

export { toNumber };
