import type { PhaseSessionRow } from "../../shared/db/schema";
import type { Relations } from "./loadRelations";
import type { BacklogItem, PhaseSession } from "./types";

function rowToSession(s: PhaseSessionRow): PhaseSession {
	return {
		phaseIdx: s.phaseIdx,
		claudeSessionId: s.claudeSessionId,
		hostname: s.hostname,
		osUser: s.osUser,
	};
}

export function attachSessions(
	item: BacklogItem,
	rel: Relations,
	id: number,
): void {
	const sessions = (rel.sessions.get(id) ?? []).map(rowToSession);
	if (sessions.length > 0) item.phaseSessions = sessions;
}
