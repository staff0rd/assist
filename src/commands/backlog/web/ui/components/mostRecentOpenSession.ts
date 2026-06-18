import { backlogTarget } from "../../../../sessions/web/ui/backlogTarget";
import type { SessionInfo } from "../../../../sessions/web/ui/useSessionSocket";

export function mostRecentOpenSession(
	sessions: SessionInfo[],
	itemId: number,
): SessionInfo | undefined {
	return sessions
		.filter((session) => backlogTarget(session)?.itemId === itemId)
		.reduce<SessionInfo | undefined>(
			(latest, session) =>
				latest && latest.startedAt >= session.startedAt ? latest : session,
			undefined,
		);
}
