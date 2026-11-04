import type { HighLevelChecklistTarget } from "./highLevelChecklistTargets";
import type { HighLevelItemState } from "./initialHighLevelState";

export function highLevelOutstanding(
	targets: HighLevelChecklistTarget[],
	state: Record<string, HighLevelItemState>,
): number {
	return targets.filter(
		(target) =>
			target.check.kind === "manual" &&
			!target.locked &&
			!state[target.key]?.ticked,
	).length;
}

export function highLevelLockedKeys(
	targets: HighLevelChecklistTarget[],
): ReadonlySet<string> {
	return new Set(
		targets.filter((target) => target.locked).map((target) => target.key),
	);
}
