import { isReviewPhase } from "../isReviewPhase";
import type { SessionInfo } from "../types";

export function reviewPhaseLabel(session: SessionInfo): string | undefined {
	const { activity } = session;
	if (activity?.kind !== "backlog" || !isReviewPhase(session)) return undefined;
	return `${activity.phase}/${activity.totalPhases}`;
}
