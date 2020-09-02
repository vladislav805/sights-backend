type CacheableFunction<ReturnType, Key> = (id: Key) => ReturnType;
type CacheEntry<Type> = {
    value: Type;
    deadAfter?: number;
};

function createCache<Type, Key = string>(fun: CacheableFunction<Type, Key>, ttl: number = Infinity) {
    const cache = new Map<Key, CacheEntry<Type>>();
    return (id: Key) => {
        if (cache.has(id)) {
            const entry = cache.get(id)!;

            if (!entry.deadAfter || entry.deadAfter > Date.now()) {
                return entry.value;
            }
        }

        const value = fun(id);
        cache.set(id, {
            value,
            deadAfter: ttl !== Infinity ? Date.now() + ttl : undefined,
        });
        return value;
    };
}

export default createCache;
