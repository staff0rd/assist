import type { SessionClient } from "./broadcast";
import { logSpawnedSession } from "./logSpawnedSession";
import { startSessionTitleGeneration } from "./startSessionTitleGeneration";
import type { OnStatusChange, Session, SpawnContext } from "./types";
import { wirePtyEvents } from "./wirePtyEvents";
import { wireSessionWatchers } from "./wireSessionWatchers";

export function registerSpawnedSession(
	session: Session,
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	notify: () => void,
	context?: SpawnContext,
): string {
	if (context?.launchedFrom) session.launchedFrom = context.launchedFrom;
	sessions.set(session.id, session);
	wirePtyEvents(session, clients, onStatusChange, notify);
	notify();
	wireSessionWatchers(session, notify, onStatusChange);
	logSpawnedSession(session);
	startSessionTitleGeneration(session, notify);
	return session.id;
}
