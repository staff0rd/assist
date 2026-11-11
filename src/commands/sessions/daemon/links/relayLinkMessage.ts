import type { HarnessKind } from "../../../../shared/harnesses";
import type { RateLimits } from "../../../../shared/RateLimits";
import type { HistoricalSession } from "../../shared/parseSessionFile";
import { daemonLog, relayDaemonLog } from "../daemonLog";
import { logUnrecognisedType } from "../logUnrecognisedType";
import {
	appendScrollback,
	broadcastToViewers,
	type LinkRelayState,
} from "./LinkRelayState";
import { relayLinkSessions } from "./relayLinkSessions";
import { relayReply } from "./relayReply";
import { relayRunConflict } from "./relayRunConflict";
import { relayToCreator } from "./relayToCreator";
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

const relayHistory: Relay = (state, msg) => {
	const sessions = ((msg.sessions as HistoricalSession[]) ?? []).map((s) => ({
		...s,
		node: state.node,
	}));
	const changed =
		JSON.stringify(sessions) !== JSON.stringify(state.lastHistory);
	state.lastHistory = sessions;
	const waiter = state.historyWaiters.shift();
	if (waiter) waiter(sessions);
	else if (changed) {
		daemonLog(`link ${state.node} ws: late history reply changed, pushing`);
		state.onHistoryChanged();
	}
};

const relays: Record<string, Relay> = {
	sessions: relayLinkSessions,
	output: relayOutput,
	clear: (state, msg) =>
		broadcastToViewers(state, { ...msg, sessionId: nsId(state, msg) }),
	created: relayToCreator("created session"),
	error: relayToCreator("peer error:"),
	notice: (state, msg) => broadcastToViewers(state, msg),
	inbox: (state, msg) => broadcastToViewers(state, msg),
	"run-conflict": relayRunConflict,
	history: relayHistory,
	"auto-update": relayReply,
	"restart-webserver": relayReply,
	"session-output": (state, msg) =>
		relayReply(state, {
			...msg,
			sessionId:
				typeof msg.sessionId === "string" ? nsId(state, msg) : undefined,
		}),
	"user-messages": (state, msg) =>
		broadcastToViewers(state, { ...msg, sessionId: nsId(state, msg) }),
	limits: (state, msg) =>
		state.onLimits(
			msg.harness as HarnessKind | undefined,
			msg.rateLimits as RateLimits,
		),
	log: (state, msg) => {
		if (typeof msg.line === "string") relayDaemonLog(state.node, msg.line);
	},
};

const notRelayed = new Set(["nodes"]);

export function relayLinkMessage(state: LinkRelayState, msg: Msg): void {
	const type = msg.type as string;
	if (Object.hasOwn(relays, type)) relays[type](state, msg);
	else if (!notRelayed.has(type))
		logUnrecognisedType(
			state.unrecognisedTypes,
			`link ${state.node} ws: `,
			msg.type,
		);
}
