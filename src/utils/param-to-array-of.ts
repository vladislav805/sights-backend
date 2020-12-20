type InputType = string | number;
type OutHandler<T> = (item: unknown) => T;

const map = <T>(handler: OutHandler<T> | undefined, items: unknown[]): T[] => handler ? items.map(handler) : items as T[];

export function paramToArrayOf(input: InputType): string[];
export function paramToArrayOf<T = string>(input: InputType, handler?: OutHandler<T>): T[];
export function paramToArrayOf<T = string>(input: InputType, handler?: OutHandler<T>): T[] {
    if (input === null || input === undefined) {
        return [];
    }

    if (Array.isArray(input)) {
        return input;
    }

    if (typeof input === 'number') {
        return map<T>(handler, [input]);
    }

    input = String(input).trim();

    if (!input || input.length === 0) {
        return [];
    }

    return map<T>(handler, input.split(',')
        .map(str => str.trim())
        .filter(Boolean));
}
