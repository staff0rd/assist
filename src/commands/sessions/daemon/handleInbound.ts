import { sendTo } from "./broadcast";
import { daemonLog, relayDaemonLog } from "./daemonLog";
import { toWindowsSessionId } from "./toWindowsSessionId";
import {
	appendScrollback,
	takePendingCreator,
	type WindowsProxyState,
} from "./WindowsProxyState";
import { handleSessions } from "./handleSessions";
import { handleHello } from "./handleHello";

type Msg = Record<string, unknown>;

export function handleInbound(state: WindowsProxyState, line: string): void {
	let msg: Msg;
	try {
		msg = JSON.parse(line);
	} catch {
		return;
	}
	inbound[msg.type as string]?.(state, msg);
}

const inbound: Record<string, (state: WindowsProxyState, msg: Msg) => void> = {
	hello: handleHello,
	created: handleCreated,
	sessions: handleSessions,
	output: handleOutput,
	// why: relay the Windows daemon's own log lines into this daemon's stream (ring + subscribers) so assist.log shows both daemons; not state.broadcast — browsers must not receive log spam.
	log: (_state, msg) => {
		if (typeof msg.line === "string") relayDaemonLog(msg.line);
	},
	clear: relayWithSessionId,
	error: (state, msg) => {
		daemonLog(`windows daemon: inbound error: ${msg.message}`);
		state.broadcast(msg);
	},
};

function handleCreated(state: WindowsProxyState, msg: Msg): void {
	daemonLog(`windows daemon: created session ${nsId(msg)}`);
	const client = takePendingCreator(state);
	if (client)
		sendTo(client, {
			type: "created",
			sessionId: nsId(msg),
			isNew: msg.isNew as boolean | undefined,
		});
	else daemonLog("windows daemon: created with no pending creator (dropped)");
}

function handleOutput(state: WindowsProxyState, msg: Msg): void {
	const sessionId = nsId(msg);
	const data = msg.data as string;
	appendScrollback(state, sessionId, data);
	state.broadcast({ type: "output", sessionId, data });
}

function relayWithSessionId(state: WindowsProxyState, msg: Msg): void {
	state.broadcast({ ...msg, sessionId: nsId(msg) });
}

function nsId(msg: Msg): string {
	return toWindowsSessionId(msg.sessionId as string);
}
