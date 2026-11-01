import { displayStatus } from "../../../displayStatus";
import { isAwaitingUser } from "../../../isAwaitingUser";
import type { SessionInfo } from "../../../types";

export function nextWaitingSessionId(
	sessions: SessionInfo[],
	activeId: string | null,
): string | null {
	const startAfterActive = sessions.findIndex((s) => s.id === activeId) + 1;
	for (let offset = 0; offset < sessions.length; offset++) {
		const session = sessions[(startAfterActive + offset) % sessions.length]!;
		if (isAwaitingUser(displayStatus(session))) return session.id;
	}
	return null;
}
