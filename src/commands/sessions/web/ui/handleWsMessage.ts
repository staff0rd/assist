import { handleClear } from "./handleClear";
import { handleCreated } from "./handleCreated";
import { handleError } from "./handleError";
import { handleLimits } from "./handleLimits";
import { handleNotice } from "./handleNotice";
import { handleOutput } from "./handleOutput";
import { handleRunConflict } from "./handleRunConflict";
import { handleSessions } from "./handleSessions";
import type { HistoricalSession, TranscriptMessage } from "./types";
import type { WsDispatch } from "./WsDispatch";

export function handleWsMessage(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	switch (msg.type) {
		case "sessions":
			handleSessions(msg, d);
			break;
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
		case "hello":
			d.setDaemonVersion(msg.version as string);
			break;
		case "error":
			handleError(msg, d);
			break;
		case "notice":
			handleNotice(msg, d);
			break;
		case "run-conflict":
			handleRunConflict(msg, d);
			break;
		case "limits":
			handleLimits(msg, d);
			break;
		case "clear":
			handleClear(msg, d);
			break;
		case "output":
			handleOutput(msg, d);
			break;
	}
}
