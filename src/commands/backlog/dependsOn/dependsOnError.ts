/** Why a phase's 1-based `dependsOn` is invalid, or undefined when every entry names an earlier phase. */
export function dependsOnError(
	dependsOn: readonly number[],
	phaseNumber: number,
): string | undefined {
	const bad = dependsOn.filter(
		(dep) => !Number.isInteger(dep) || dep < 1 || dep >= phaseNumber,
	);
	if (bad.length === 0) return undefined;
	const earlier =
		phaseNumber > 1
			? `an earlier phase (1–${phaseNumber - 1})`
			: "an earlier phase, and phase 1 has none";
	return `phase ${phaseNumber} dependsOn ${bad.join(", ")}: each entry must be ${earlier}`;
}
