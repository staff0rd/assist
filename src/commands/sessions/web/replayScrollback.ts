import type { WebSocket } from "ws";
import type { Session } from "./createSession";
import { wsSend } from "./wsBroadcast";

export function replayScrollback(
	sessions: Map<string, Session>,
	ws: WebSocket,
): void {
	for (const s of sessions.values()) {
		if (s.scrollback)
			wsSend(ws, { type: "output", sessionId: s.id, data: s.scrollback });
	}
}
