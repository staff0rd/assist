export function lastIndexWhere<T>(
	items: T[],
	predicate: (item: T) => boolean,
): number {
	for (let index = items.length - 1; index >= 0; index--)
		if (predicate(items[index])) return index;
	return -1;
}
