import { parseDependsOnOption } from "./parseDependsOnOption";
import { toStoredDependsOn } from "./toStoredDependsOn";

/** `add-phase --depends-on` as both the 1-based list for review and its stored form, or false when invalid. */
export function parseAddPhaseDependsOn(
	values: string[] | undefined,
	phaseIdx: number,
): { dependsOn: number[] | undefined; stored: number[] | null } | false {
	const dependsOn = parseDependsOnOption(values, phaseIdx + 1);
	if (dependsOn === false) return false;
	return { dependsOn, stored: toStoredDependsOn(dependsOn, phaseIdx) };
}
