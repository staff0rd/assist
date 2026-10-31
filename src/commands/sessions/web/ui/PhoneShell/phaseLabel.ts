import type { SessionInfo } from "../types";
import { reviewPhaseLabel } from "./reviewPhaseLabel";

export function phaseLabel(session: SessionInfo): string | undefined {
	const { activity } = session;
	if (activity?.kind !== "backlog" || !activity.phase) return undefined;
	if (reviewPhaseLabel(session)) return undefined;
	return activity.totalPhases
		? `${activity.phase}/${activity.totalPhases}`
		: `${activity.phase}`;
}
