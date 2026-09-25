import { handleClear } from "./handleWsMessage/handleClear";
import { handleCreated } from "./handleWsMessage/handleCreated";
import { handleError } from "./handleWsMessage/handleError";
import { handleLimits } from "./handleWsMessage/handleLimits";
import { handleNotice } from "./handleWsMessage/handleNotice";
import { handleOutput } from "./handleWsMessage/handleOutput";
import { handleRunConflict } from "./handleWsMessage/handleRunConflict";
import { handleSessions } from "./handleWsMessage/handleSessions";
import type {
	HistoricalSession,
	TranscriptMessage,
} from "../../../../../types";
import type { WsDispatch } from "../../WsDispatch";

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
