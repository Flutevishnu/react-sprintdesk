export function groupBy<T, K extends string | number>(
    items: readonly T[], 
    keyFn: (item: T) => K
): Record<K, T[]> {

    const result = items.reduce((prev, curr) => {
        const key = keyFn(curr);
        if (prev[key] === undefined){
            prev[key] = [];
        }
        prev[key].push(curr);
        return prev;
    }, {} as Record<K, T[]>)
    return result;
}


export function updateItemById<T extends {id: string | number}>(
    items: readonly T[],
    id: T["id"],
    patch: Partial<T>
): T[] {
    return items.map((item) => 
        item.id === id ? {...item, ...patch} : item
    );
}


export function deepPick(obj: unknown, path: string): unknown {
    return path.split(".").reduce((curr, key) => {
        if (typeof curr != "object" || curr === null) {
            return undefined;
        }
        return (curr as Record<string, unknown>)[key];
    }, obj)
}


export function debounce<A extends unknown[]>(
    fn: (...args: A) => void,
    ms: number
): (...args: A) => void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    
    return (...args: A) => {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => fn(...args), ms);
    };
}


export function unique<T>(items: readonly T[]): T[] {
    return [...new Set(items)];
}


export function sortBy<T>(
    items: readonly T[],
    keyFn: (item: T) => string | number
): T[] {
    return [...items].sort((a, b) => {
        const keyA = keyFn(a);
        const keyB = keyFn(b);

        if (typeof keyA === "number" && typeof keyB === "number") {
            return keyA - keyB;
        }
        return String(keyA).localeCompare(String(keyB));
    });
}


export function partition<T>(
    items: readonly T[],
    predicate: (item: T) => boolean
): [T[], T[]] {
    const matching: T[] = [];
    const rest: T[] = [];

    for (const item of items) {
        if (predicate(item)) {
            matching.push(item);
        } else {
            rest.push(item);
        }
    }

    return [matching, rest];
}

export function omit<T extends object, K extends keyof T>(
    obj: T,
    keys: readonly K[]
): Omit<T, K> {
    const keysToRemove = new Set<string>(keys.map(String));

    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keysToRemove.has(key))
    ) as Omit<T, K>;
}


export function getOrDefault<T>(value: T | null | undefined, fallback: T): T {
    return value ?? fallback;
}


export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function retry<T>(
    fn: () => Promise<T>,
    attempts: number
): Promise<T> {
    if (attempts < 1) {
        throw new Error("attempts must be at least 1");
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

export function countBy<T, K extends string | number>(
    items: readonly T[],
    keyFn: (item: T) => K
): Record<K, number> {
    return items.reduce((counts, item) => {
        const key = keyFn(item);
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
    }, {} as Record<K, number>);
}