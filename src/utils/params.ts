import { ApiParam } from '../types/api';

export enum Type {
    Number,
    NumberArray,
    String,
    StringArray,
    Boolean
}

export type ParamEntry = {
    name: string;
    type: Type;
    required?: boolean;
    defaultValue?: ApiParam;
}

/** @deprecated */
const checkForNumber = (value: string) => !isNaN(+value);

/** @deprecated */
const isListContainNotNumber = (list: string[]) => list.some(value => isNaN(+value));

/** @deprecated */
const getBooleanValue = (value: string) => {
    if (value === 'true' || value === '1') {
        return true;
    }

    if (value === 'false' || value === '0') {
        return false;
    }

    throw new Error('unknown value for boolean');
};

/** @deprecated */
export const convert = <T>(params: Record<string, string>, rules: ParamEntry[]): T => {
    const result = {};

    for (const entry of rules) {
        const { type, name, required, defaultValue } = entry;

        let value: string | undefined = params[name];

        if (value === undefined) {
            if (required && defaultValue === undefined) {
                throw new Error(`Not specified required argument ${name}`);
            }

            result[name] = defaultValue;
            continue;
        }

        switch (type) {
            case Type.Boolean: {
                result[name] = getBooleanValue(value);
                break;
            }

            case Type.Number: {
                if (!checkForNumber(value)) {
                    throw new Error(`Invalid number format for value of argument ${name}`);
                }

                result[name] = +value;
                break;
            }

            case Type.String: {
                if (required && !value.trim().length) {
                    throw new Error(`Empty value for param ${name}`);
                }

                result[name] = value;
                break;
            }

            case Type.NumberArray: {
                let list = value.length > 0 ? value.split(',') : (defaultValue as string[] || []);

                if (isListContainNotNumber(list)) {
                    throw new Error(`Invalid number format for param ${name}`);
                }

                result[name] = list.map(Number);
                break;
            }

            case Type.StringArray: {
                result[name] = value.split(',');
                break;
            }
        }
    }

    return result as T;
};
