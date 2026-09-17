type YRange = { minY: number; maxY: number };

const toCentsWithoutFloatError = (value: number): number =>
	Number((value * 100).toFixed(6));

export function chartYRange(values: number[]): YRange {
	const min = Math.min(...values);
	const max = Math.max(...values);
	const span = max - min;
	const pad = span === 0 ? Math.max(Math.abs(max) * 0.1, 1) : span * 0.2;

	return {
		minY: Math.floor(toCentsWithoutFloatError(min - pad)) / 100,
		maxY: Math.ceil(toCentsWithoutFloatError(max + pad)) / 100,
	};
}
