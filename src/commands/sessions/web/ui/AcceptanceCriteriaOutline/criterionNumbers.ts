export function criterionNumbers(depths: number[]): string[] {
	const counters: number[] = [];
	return depths.map((depth) => {
		counters.length = depth + 1;
		counters[depth] = (counters[depth] ?? 0) + 1;
		return counters.map((count) => count ?? 1).join(".");
	});
}
