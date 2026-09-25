import { displayStatus } from "../../displayStatus";
import type { SessionInfo } from "../../../types";

export function nextWaitingSessionId(
	sessions: SessionInfo[],
	activeId: string | null,
): string | null {
	const startAfterActive = sessions.findIndex((s) => s.id === activeId) + 1;
	for (let offset = 0; offset < sessions.length; offset++) {
		const session = sessions[(startAfterActive + offset) % sessions.length]!;
		if (displayStatus(session) === "waiting") return session.id;
	}
	return null;
}
