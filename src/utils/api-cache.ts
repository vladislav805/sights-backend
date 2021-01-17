type CacheEntry<Type> = {
    value: Type;
    deadAfter?: number;
};

export class CacheStore<Type, Key = string> {
    /**
     * Мап для хранения данных
     * @private
     */
    private readonly cache: Map<Key, CacheEntry<Type>>;

    /**
     * Время жизни кэша в миллисекундах
     * @private
     */
    private readonly ttl: number;

    /**
     *
     * @param ttl Время жизни кэша в секундах
     */
    public constructor(ttl: number = Infinity) {
        this.cache = new Map<Key, CacheEntry<Type>>();
        this.ttl = ttl * 1000;
    }

    public set(key: Key, value: Type): void {
        this.cache.set(key, {
            value,
            deadAfter: this.ttl !== Infinity ? Date.now() + this.ttl : undefined,
        });
    }

    public get(key: Key): Type | undefined {
        if (this.cache.has(key)) {
            const entry = this.cache.get(key)!;

            if (!entry.deadAfter || entry.deadAfter > Date.now()) {
                return entry.value;
            }
        }

        return undefined;
    }
}
