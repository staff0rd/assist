import type { RateLimits } from "../../../../shared/RateLimits";
import { handleClear } from "./handleClear";
import { handleCreated } from "./handleCreated";
import { handleOutput } from "./handleOutput";
import { resolveActiveId } from "./resolveActiveId";
import type {
	HistoricalSession,
	SessionInfo,
	TranscriptMessage,
} from "./types";
import type { WsDispatch } from "./WsDispatch";

export function handleWsMessage(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	switch (msg.type) {
		case "sessions": {
			const sessions = msg.sessions as SessionInfo[];
			d.setSessions(sessions);
			if (msg.cwd) d.setCurrentCwd(msg.cwd as string);
			// why: resolve the daemon's per-repo selection map to this UI's single active card
			const active = (msg.active ?? {}) as Record<string, string>;
			d.setDaemonActiveId(resolveActiveId(active, sessions));
			break;
		}
		case "created":
			handleCreated(msg, d);
			break;
		case "history":
			d.setHistory(msg.sessions as HistoricalSession[]);
			break;
		case "transcript":
			d.setTranscript({
				sessionId: msg.sessionId as string,
				messages: msg.messages as TranscriptMessage[],
			});
			break;
		case "error":
			d.setError(msg.message as string);
			break;
		case "limits":
			d.setRateLimits(msg.rateLimits as RateLimits);
			break;
		case "clear":
			handleClear(msg, d);
			break;
		case "output":
			handleOutput(msg, d);
			break;
	}
}
