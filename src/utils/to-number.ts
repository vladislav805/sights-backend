import { ApiParam } from '../types/api';
import { ApiError, ErrorCode } from '../error';

function toNumber(val: ApiParam): number;
function toNumber(val: ApiParam, silent: boolean): number | undefined;
function toNumber(val: ApiParam, silent: boolean = false): number | undefined {
    if (typeof val === 'undefined') {
        return undefined;
    }

    if (typeof val === 'number') {
        return val;
    }

    val = Number(val);

    if (isNaN(val)) {
        if (silent) {
            return undefined;
        } else {
            throw new ApiError(ErrorCode.EXPECTED_NUMBER, 'Expected number');
        }
    }

    return val;
}

export { toNumber };
