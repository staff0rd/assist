import { normalizeDependsOn } from "./normalizeDependsOn";

/** A phase's 1-based dependencies when they differ from "the previous phase", else undefined. */
export function differingDependsOn(
	dependsOn: readonly number[] | undefined,
	phaseNumber: number,
): number[] | undefined {
	const normalized = normalizeDependsOn(
		dependsOn?.map((dep) => dep - 1),
		phaseNumber - 1,
	);
	return normalized?.map((idx) => idx + 1);
}
