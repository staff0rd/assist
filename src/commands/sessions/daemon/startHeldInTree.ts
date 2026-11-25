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
			heldOnSameTree(session, seeded)
		) {
			if (failure)
				failHeldStart(session, heldFailure(session, seeded, failure));
			start(session);
		}
}

function heldOnSameTree(session: Session, seeded: Session): boolean {
	if (session.cwd === seeded.cwd) return true;
	const path = seeded.worktree?.path;
	return (
		session.awaitingSeed === true &&
		path !== undefined &&
		session.worktree?.path === path
	);
}

function heldFailure(session: Session, seeded: Session, failure: string) {
	if (session.commandType !== "run") return failure;
	return `${failure}\nFix the install on session ${seeded.id} ("${seeded.name}"), then launch this run again.`;
}
