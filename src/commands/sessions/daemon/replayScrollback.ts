import { skipsTerminalPath } from "./skipsTerminalPath";
import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { sessionSnapshot } from "./sessionSnapshot";

export function replayScrollback(
	sessions: Map<string, Session>,
	client: SessionClient,
): void {
	for (const s of sessions.values()) {
		if (skipsTerminalPath(s, "scrollback replay")) continue;
		if (s.scrollback)
			sendTo(client, {
				type: "output",
				sessionId: s.id,
				data: sessionSnapshot(s),
			});
	}
}
