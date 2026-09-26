import type { HistoricalSession } from "../../shared/parseSessionFile";
import { sendTo } from "../broadcast";
import { daemonLog, relayDaemonLog } from "../daemonLog";
import {
	appendScrollback,
	broadcastToViewers,
	type LinkRelayState,
	takePendingCreator,
} from "./LinkRelayState";
import { relayLinkSessions } from "./relayLinkSessions";
import { relayRunConflict } from "./relayRunConflict";
import { toNodeSessionId } from "./splitNodeSessionId";

type Msg = Record<string, unknown>;
type Relay = (state: LinkRelayState, msg: Msg) => void;

const nsId = (state: LinkRelayState, msg: Msg) =>
	toNodeSessionId(state.node, msg.sessionId as string);

const relayOutput: Relay = (state, msg) => {
	const sessionId = nsId(state, msg);
	appendScrollback(state, sessionId, msg.data as string);
	broadcastToViewers(state, { type: "output", sessionId, data: msg.data });
};

const relayToCreator =
	(label: string): Relay =>
	(state, msg) => {
		daemonLog(
			`link ${state.node} ws: ${label} ${msg.sessionId ?? msg.message}`,
		);
		const client = takePendingCreator(state);
		const reply =
			msg.type === "created" ? { ...msg, sessionId: nsId(state, msg) } : msg;
		if (client) sendTo(client, reply);
		else if (msg.type === "error") broadcastToViewers(state, reply);
		else
			daemonLog(`link ${state.node} ws: ${msg.type} with no pending creator`);
	};

const relayHistory: Relay = (state, msg) => {
	const sessions = (msg.sessions as HistoricalSession[]) ?? [];
	state.historyWaiters.shift()?.(
		sessions.map((s) => ({ ...s, node: state.node })),
	);
};

const relays: Record<string, Relay> = {
	sessions: relayLinkSessions,
	output: relayOutput,
	clear: (state, msg) =>
		broadcastToViewers(state, { ...msg, sessionId: nsId(state, msg) }),
	created: relayToCreator("created session"),
	error: relayToCreator("peer error:"),
	notice: (state, msg) => broadcastToViewers(state, msg),
	"run-conflict": relayRunConflict,
	history: relayHistory,
	log: (state, msg) => {
		if (typeof msg.line === "string") relayDaemonLog(state.node, msg.line);
	},
};

export function relayLinkMessage(state: LinkRelayState, msg: Msg): void {
	relays[msg.type as string]?.(state, msg);
}
