import { sendTo } from "./broadcast";
import { ASSIST_VERSION, isHello, versionsMatch } from "./buildHello";
import type { SessionInfo } from "./createSession";
import { daemonLog } from "./daemonLog";
import { toWindowsSessionId } from "./toWindowsSessionId";
import { appendScrollback, type WindowsProxyState } from "./WindowsProxyState";

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
	hello: (_state, msg) => handleHello(msg),
	created: handleCreated,
	sessions: handleSessions,
	output: handleOutput,
	clear: relayWithSessionId,
	error: (state, msg) => state.broadcast(msg),
};

function handleHello(msg: Msg): void {
	if (isHello(msg) && !versionsMatch(msg.version, ASSIST_VERSION))
		daemonLog(
			`windows daemon version mismatch: ${msg.version} (wsl ${ASSIST_VERSION})`,
		);
}

function handleCreated(state: WindowsProxyState, msg: Msg): void {
	const client = state.pendingCreators.shift();
	if (client) sendTo(client, { type: "created", sessionId: nsId(msg) });
}

function handleSessions(state: WindowsProxyState, msg: Msg): void {
	state.windowsSessions = (msg.sessions as SessionInfo[]).map((s) => ({
		...s,
		id: toWindowsSessionId(s.id),
	}));
	const live = new Set(state.windowsSessions.map((s) => s.id));
	for (const id of state.scrollback.keys())
		if (!live.has(id)) state.scrollback.delete(id);
	state.onSessionsChanged();
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
