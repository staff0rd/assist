import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";

/** Percent through the authored phases, counting the current one as half done. */
export function phaseProgress(item: AutopilotItemView): number {
	if (item.totalPhases === 0) return 0;
	return Math.min(100, ((item.donePhases + 0.5) / item.totalPhases) * 100);
}
