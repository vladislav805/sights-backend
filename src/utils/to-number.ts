import { ApiParam } from '../types/api';
import { ApiError, ErrorCode } from '../error';

function toNumber(val: ApiParam): number;
function toNumber(val: ApiParam, defaultValue: number): number;
function toNumber(val: ApiParam, silent: boolean): number | undefined;
function toNumber(val: ApiParam, defaultValue: boolean | number = false): number | undefined {
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

        if (defaultValue) {
            return undefined;
        }

        throw new ApiError(ErrorCode.EXPECTED_NUMBER, 'Expected number');
    }

    return number;
}

export { toNumber };
