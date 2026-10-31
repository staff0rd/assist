export function matchKeys(a: string[], b: string[]): [number, number][] {
	const lengths = Array.from({ length: a.length + 1 }, () =>
		Array.from({ length: b.length + 1 }, () => 0),
	);
	for (let i = a.length - 1; i >= 0; i--)
		for (let j = b.length - 1; j >= 0; j--)
			lengths[i][j] =
				a[i] === b[j]
					? lengths[i + 1][j + 1] + 1
					: Math.max(lengths[i + 1][j], lengths[i][j + 1]);
	const pairs: [number, number][] = [];
	let i = 0;
	let j = 0;
	while (i < a.length && j < b.length) {
		if (a[i] === b[j]) pairs.push([i++, j++]);
		else if (lengths[i + 1][j] >= lengths[i][j + 1]) i++;
		else j++;
	}
	return pairs;
}
