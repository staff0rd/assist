import type { SessionInfo } from "./types";

export function isReviewPhase({ activity }: SessionInfo): boolean {
	return (
		activity?.kind === "backlog" &&
		!!activity.phase &&
		activity.phase === activity.totalPhases
	);
}
