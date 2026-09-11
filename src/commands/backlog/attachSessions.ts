import type { PhaseSessionRow } from "../../shared/db/schema";
import type { Relations } from "./loadRelations";
import type { BacklogItem, PhaseSession } from "./types";

function rowToSession(s: PhaseSessionRow): PhaseSession {
	const session: PhaseSession = {
		phaseIdx: s.phaseIdx,
		claudeSessionId: s.claudeSessionId,
		hostname: s.hostname,
		osUser: s.osUser,
	};
	if (s.createdAt != null)
		session.createdAt = new Date(s.createdAt).toISOString();
	return session;
}

export function attachSessions(
	item: BacklogItem,
	rel: Relations,
	id: number,
): void {
	const sessions = (rel.sessions.get(id) ?? []).map(rowToSession);
	if (sessions.length > 0) item.phaseSessions = sessions;
}
