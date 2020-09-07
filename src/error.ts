export const enum ErrorCode {
    UNKNOWN = 970,
    UNKNOWN_METHOD = 1,
    UNSPECIFIED_PARAM = 2,

    SESSION_INVALID = 7,
    AUTH_KEY_NOT_SPECIFIED = 8,
    EXPECTED_NUMBER = 9,

    NAME_SHORT = 11,
    LOGIN_LENGTH = 12,
    PASSWORD_LENGTH = 13,
    SEX_UNKNOWN = 14,
    INVALID_EMAIL = 15,
    LOGIN_ALREADY_TAKEN = 16,
    EMAIL_ALREADY_REGISTERED = 17,
    ACCOUNT_TAKEN = 18,
    ETC_REGISTER_ERROR = 19,

    TELEGRAM_INVALID_HASH = 20,

    ALREADY_FOLLOWING = 31,
    NOT_FOLLOWING = 32,
    FOLLOW_YOURSELF = 33,

    SIGHT_NOT_FOUND = 40,
    PLACES_ONLY_TWO_POINTS = 41,
    PLACES_INVALID_AREA_FORMAT = 42,
    SIGHT_BITMASK_CONFLICT = 43,
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
