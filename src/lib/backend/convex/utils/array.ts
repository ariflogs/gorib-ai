// Minimal array utilities needed for Convex actions

export function fromMap<K, V, T>(map: Map<K, V>, fn: (key: K, value: V) => T): T[] {
	const items: T[] = [];
	for (const [key, value] of map) {
		items.push(fn(key, value));
	}
	return items;
}

export function toMap<T, K, V>(
	arr: T[],
	fn: (item: T, index: number) => [key: K, value: V]
): Map<K, V> {
	const map: Map<K, V> = new Map();
	for (let i = 0; i < arr.length; i++) {
		const [key, value] = fn(arr[i]!, i);
		map.set(key, value);
	}
	return map;
}
