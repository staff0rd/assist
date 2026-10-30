import { handleClear } from "./handleWsMessage/handleClear";
import { handleCreated } from "./handleWsMessage/handleCreated";
import { handleError } from "./handleWsMessage/handleError";
import { handleLimits } from "./handleWsMessage/handleLimits";
import { handleNodes } from "./handleWsMessage/handleNodes";
import { handleNotice } from "./handleWsMessage/handleNotice";
import { handleOutput } from "./handleWsMessage/handleOutput";
import { handleRunConflict } from "./handleWsMessage/handleRunConflict";
import { handleSessions } from "./handleWsMessage/handleSessions";
import { handleSnapshot } from "./handleWsMessage/handleSnapshot";
import { inboxStore } from "../../../../../App/AppShell/AppRoutes/InboxView/inboxStore";
import type {
	HistoricalSession,
	TranscriptMessage,
} from "../../../../../types";
import type { WsDispatch } from "../../WsDispatch";

type Msg = Record<string, unknown>;

const wsHandlers: Record<string, (msg: Msg, d: WsDispatch) => void> = {
	sessions: handleSessions,
	created: handleCreated,
	history: (msg, d) => d.setHistory(msg.sessions as HistoricalSession[]),
	transcript: (msg, d) =>
		d.setTranscript({
			sessionId: msg.sessionId as string,
			messages: msg.messages as TranscriptMessage[],
		}),
	"user-messages": (msg, d) =>
		d.setUserMessages({
			sessionId: msg.sessionId as string,
			messages: msg.messages as string[],
		}),
	hello: (msg, d) => d.setDaemonVersion(msg.version as string),
	nodes: handleNodes,
	error: handleError,
	notice: handleNotice,
	inbox: () => {
		void inboxStore.refresh();
		void inboxStore.refreshStatus();
	},
	"run-conflict": handleRunConflict,
	limits: handleLimits,
	clear: handleClear,
	output: handleOutput,
	snapshot: handleSnapshot,
};

export function handleWsMessage(msg: Msg, d: WsDispatch): void {
	wsHandlers[msg.type as string]?.(msg, d);
}
