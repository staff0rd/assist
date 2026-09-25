function rowsAt(widths: number[], gap: number, limit: number): number {
	let rows = 1;
	let line = 0;
	for (const width of widths) {
		const next = line === 0 ? width : line + gap + width;
		if (next > limit && line > 0) {
			rows++;
			line = width;
		} else line = next;
	}
	return rows;
}

export function balancedWrapWidth(
	widths: number[],
	gap: number,
	available: number,
): number | undefined {
	if (widths.length === 0) return undefined;
	const total =
		widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1);
	if (total <= available) return undefined;
	const rows = rowsAt(widths, gap, available);
	let lo = Math.ceil(Math.max(...widths));
	let hi = Math.max(lo, Math.floor(available));
	while (lo < hi) {
		const mid = Math.floor((lo + hi) / 2);
		if (rowsAt(widths, gap, mid) <= rows) hi = mid;
		else lo = mid + 1;
	}
	return lo + 1;
}
