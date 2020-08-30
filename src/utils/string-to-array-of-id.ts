export function stringToArrayOfId(input: string | number): number[];
export function stringToArrayOfId(input: string | number, raw: true): (string | number)[];
export function stringToArrayOfId(input: string | number, raw: boolean = false): (string | number)[] | number[] {
    if (typeof input === 'number') {
        return [input];
    }

    if (!input || input.length === 0) {
        return [];
    }

    let ids: (number | string)[] = input.split(',');

    return raw ? ids : ids.map(Number);
}
