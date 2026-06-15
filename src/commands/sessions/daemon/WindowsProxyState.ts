import { type SessionClient, sendTo } from "./broadcast";
import type { SessionInfo } from "./createSession";

const MAX_SCROLLBACK = 256 * 1024;

// Shared state between the proxy's connection lifecycle and inbound relay.
export type WindowsProxyState = {
	windowsSessions: SessionInfo[];
	scrollback: Map<string, string>;
	pendingCreators: SessionClient[];
	broadcast: (msg: object) => void;
	onSessionsChanged: () => void;
};

export function createState(
	broadcast: (msg: object) => void,
	onSessionsChanged: () => void,
): WindowsProxyState {
	return {
		windowsSessions: [],
		scrollback: new Map(),
		pendingCreators: [],
		broadcast,
		onSessionsChanged,
	};
}

export function resetState(state: WindowsProxyState): void {
	state.windowsSessions = [];
	state.scrollback.clear();
	state.pendingCreators = [];
}

export function replayScrollback(
	state: WindowsProxyState,
	client: SessionClient,
): void {
	for (const [sessionId, data] of state.scrollback)
		if (data) sendTo(client, { type: "output", sessionId, data });
}

export function appendScrollback(
	state: WindowsProxyState,
	sessionId: string,
	data: string,
): void {
	const next = (state.scrollback.get(sessionId) ?? "") + data;
	state.scrollback.set(
		sessionId,
		next.length > MAX_SCROLLBACK ? next.slice(-MAX_SCROLLBACK) : next,
	);
}
