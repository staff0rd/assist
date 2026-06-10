export function calculateMaintainabilityIndex(
	halsteadVolume: number,
	cyclomaticComplexity: number,
	sloc: number,
): number {
	if (halsteadVolume === 0 || sloc === 0) {
		return 100;
	}
	const mi =
		171 -
		5.2 * Math.log(halsteadVolume) -
		0.23 * cyclomaticComplexity -
		16.2 * Math.log(sloc);
	return Math.max(0, Math.min(100, mi));
}
