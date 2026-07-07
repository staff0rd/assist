import { type SessionClient, sendTo } from "./broadcast";
import type { SessionInfo } from "./createSession";
import { stripReplayQueries } from "./stripReplayQueries";

const MAX_SCROLLBACK = 256 * 1024;

const DEFAULT_CREATE_TIMEOUT_MS = 5_000;

type PendingCreator = {
	client: SessionClient;
	timer: ReturnType<typeof setTimeout>;
};

// Shared state between the proxy's connection lifecycle and inbound relay.
export type WindowsProxyState = {
	windowsSessions: SessionInfo[];
	scrollback: Map<string, string>;
	pendingCreators: PendingCreator[];
	createTimeoutMs: number;
	broadcast: (msg: object) => void;
	onSessionsChanged: () => void;
	onVersionMismatch: (version: string) => void;
};

export function createState(
	broadcast: (msg: object) => void,
	onSessionsChanged: () => void,
	onVersionMismatch: (version: string) => void,
	createTimeoutMs: number = DEFAULT_CREATE_TIMEOUT_MS,
): WindowsProxyState {
	return {
		windowsSessions: [],
		scrollback: new Map(),
		pendingCreators: [],
		createTimeoutMs,
		broadcast,
		onSessionsChanged,
		onVersionMismatch,
	};
}

export function resetState(state: WindowsProxyState): void {
	state.windowsSessions = [];
	state.scrollback.clear();
	for (const { timer } of state.pendingCreators) clearTimeout(timer);
	state.pendingCreators = [];
}

export function takePendingCreator(
	state: WindowsProxyState,
): SessionClient | undefined {
	const pending = state.pendingCreators.shift();
	if (!pending) return undefined;
	clearTimeout(pending.timer);
	return pending.client;
}

// why: notify waiting creators with an error rather than dropping them silently — a silent drop is the #455 hang.
export function failPendingCreators(
	state: WindowsProxyState,
	message: string,
): void {
	for (const { client, timer } of state.pendingCreators) {
		clearTimeout(timer);
		sendTo(client, { type: "error", message });
	}
	state.pendingCreators = [];
}

export function replayScrollback(
	state: WindowsProxyState,
	client: SessionClient,
): void {
	for (const [sessionId, data] of state.scrollback)
		if (data)
			sendTo(client, {
				type: "output",
				sessionId,
				data: stripReplayQueries(data),
			});
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
