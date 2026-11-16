import type { SessionClient } from "./broadcast";
import { failHeldStart } from "./failHeldStart";
import { startHeldSession } from "./startHeldSession";
import type { OnStatusChange, Session } from "./types";

export function startHeldInTree(
	seeded: Session,
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	notify: () => void,
	failure?: string,
): void {
	const start = (session: Session) =>
		startHeldSession(session, sessions, clients, onStatusChange, notify);
	start(seeded);
	for (const session of sessions.values())
		if (
			session !== seeded &&
			session.pendingStart &&
			session.cwd === seeded.cwd
		) {
			if (failure) failHeldStart(session, failure);
			start(session);
		}
}
