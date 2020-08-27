export const packIdentitiesToSql = (table: string, prefix: string, names: string[]) => {
    const result: string[] = [];

    for (const name of names) {
        result.push(`\`${table}\`.\`${name}\` as \`${prefix}_${name}\``);
    }

    return result;
};

export const unpackObject = <Raw extends object, Excl extends string, Result = Record<Excl, unknown>>(raw: Record<keyof Raw & Excl, unknown>, prefix: string, exclude: Excl[]): Result => {
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
