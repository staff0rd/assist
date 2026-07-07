import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { stripReplayQueries } from "./stripReplayQueries";

export function replayScrollback(
	sessions: Map<string, Session>,
	client: SessionClient,
): void {
	for (const s of sessions.values()) {
		if (s.scrollback)
			sendTo(client, {
				type: "output",
				sessionId: s.id,
				data: stripReplayQueries(s.scrollback),
			});
	}
}
