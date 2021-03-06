export const wrapIdentify = (name: string) => `\`${name}\``;

export const packIdentitiesToSql = (table: string, prefix: string, names: string[]) => {
    const result: string[] = [];

    for (const name of names) {
        result.push(`${wrapIdentify(table)}.${wrapIdentify(name)} as ${wrapIdentify(`${prefix}_${name}`)}`);
    }

    return result;
};

export const unpackObject = <
    Raw extends object,
    Result = Record<string, unknown>,
    Excl extends keyof Result = keyof Result,
>(raw: Record<keyof Raw & Excl, unknown>, prefix: string, exclude: Excl[]): Result => {
    const result: Record<Excl, unknown> = {} as Record<Excl, unknown>;

    for (const key of exclude) {
        const rawKey = `${prefix}_${key}`;

        if (raw.hasOwnProperty(rawKey)) {
            result[key as Excl] = raw[rawKey];
            delete raw[rawKey];
        }
    }

    return result as unknown as Result;
};
