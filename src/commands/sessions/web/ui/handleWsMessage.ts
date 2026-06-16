import type { RateLimits } from "../../../../shared/RateLimits";
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
		case "sessions":
			d.setSessions(msg.sessions as SessionInfo[]);
			if (msg.cwd) d.setCurrentCwd(msg.cwd as string);
			break;
		case "created":
			// why: creating/resuming switches the pane back to the live terminal
			d.setViewingTranscriptSessionId(null);
			d.setActiveId(msg.sessionId as string);
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

function handleClear(msg: Record<string, unknown>, d: WsDispatch): void {
	const id = msg.sessionId as string;
	d.buffers.current?.delete(id);
	d.handlers.current?.get(id)?.("\x1bc");
}

function handleOutput(msg: Record<string, unknown>, d: WsDispatch): void {
	const id = msg.sessionId as string;
	const prev = d.buffers.current?.get(id) ?? "";
	d.buffers.current?.set(id, prev + (msg.data as string));
	d.handlers.current?.get(id)?.(msg.data as string);
	d.markInitialized(id);
}
