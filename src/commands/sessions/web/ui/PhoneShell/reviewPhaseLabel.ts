import type { SessionInfo } from "../types";

export function reviewPhaseLabel({
	activity,
}: SessionInfo): string | undefined {
	if (activity?.kind !== "backlog" || !activity.phase) return undefined;
	if (activity.phase !== activity.totalPhases) return undefined;
	return `${activity.phase}/${activity.totalPhases}`;
}
