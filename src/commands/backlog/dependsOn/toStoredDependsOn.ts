import { normalizeDependsOn } from "./normalizeDependsOn";

/** Convert 1-based phase numbers to the stored 0-based column value for the phase at `idx`. */
export function toStoredDependsOn(
	dependsOn: readonly number[] | undefined,
	idx: number,
): number[] | null {
	return normalizeDependsOn(
		dependsOn?.map((dep) => dep - 1),
		idx,
	);
}
