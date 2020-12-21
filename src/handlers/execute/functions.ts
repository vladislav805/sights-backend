export function col<T>(obj: T[], key: keyof T): T[keyof T][] {
    if (!Array.isArray(obj)) {
        return [];
    }

    if (!key) {
        return Array(obj.length).fill(null);
    }

    return obj.map(item => item[key]);
}

export function concat() {
    return Array.from(arguments).reduce((acc, item) => {
        if (Array.isArray(item)) {
            acc.splice(acc.length, 0, ...item);
        } else {
            acc.splice(acc.length, 0, item);
        }
        return acc;
    }, []);
}
