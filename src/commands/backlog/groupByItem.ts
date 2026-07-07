/** Group rows by their `itemId`, preserving the order rows arrive in. */
export function groupByItem<T extends { itemId: number }>(
	rows: T[],
): Map<number, T[]> {
	const map = new Map<number, T[]>();
	for (const row of rows) {
		const bucket = map.get(row.itemId);
		if (bucket) bucket.push(row);
		else map.set(row.itemId, [row]);
	}
	return map;
}
