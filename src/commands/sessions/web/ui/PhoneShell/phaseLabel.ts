import type { SessionInfo } from "../types";

export function phaseLabel({ activity }: SessionInfo): string | undefined {
	if (activity?.kind !== "backlog" || !activity.phase) return undefined;
	return activity.totalPhases
		? `${activity.phase}/${activity.totalPhases}`
		: `${activity.phase}`;
}
