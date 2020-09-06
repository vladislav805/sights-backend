export const enum ErrorCode {
    UNKNOWN = 970,
    UNKNOWN_METHOD = 1,
    UNSPECIFIED_PARAM = 2,

    SESSION_INVALID = 7,
    AUTH_KEY_NOT_SPECIFIED = 8,
    EXPECTED_NUMBER = 9,

    ALREADY_FOLLOWING = 21,
    NOT_FOLLOWING = 22,
    FOLLOW_YOURSELF = 23,

    SIGHT_NOT_FOUND = 30,
    PLACES_ONLY_TWO_POINTS = 31,
    PLACES_INVALID_AREA_FORMAT = 32,
    SIGHT_BITMASK_CONFLICT = 33,
}

export class ApiError extends Error {
    public readonly code;

    public constructor(code: ErrorCode, message?: string) {
        super(message);

        this.code = code;

        console.trace('Occurred here');
    }

    public toString() {
        return `#${this.code} - ${this.message}`;
    }
}

export class UnspecifiedParamError extends ApiError {
    public constructor(name: string) {
        super(ErrorCode.UNSPECIFIED_PARAM, `Unspecified param "${name}"`);
    }
}
