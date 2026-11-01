import { backlogTarget } from "../../../../sessions/web/ui/backlogTarget";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { backlogRunItemId } from "../../../backlogRunItemId";

export function runInFlightSession(
	sessions: SessionInfo[],
	itemId: number,
): SessionInfo | undefined {
	return sessions.find(
		(session) =>
			session.status !== "done" &&
			session.status !== "error" &&
			(backlogRunItemId(session.assistArgs) === itemId ||
				backlogTarget(session)?.itemId === itemId),
	);
}
