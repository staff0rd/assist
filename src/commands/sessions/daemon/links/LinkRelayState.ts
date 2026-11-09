import type { HarnessKind } from "../../../../shared/harnesses";
import type { RateLimits } from "../../../../shared/RateLimits";
import type { HistoricalSession } from "../../shared/parseSessionFile";
import { broadcast, type SessionClient, sendTo } from "../broadcast";
import type { SessionInfo } from "../createSession";
import { stripReplayQueries } from "../stripReplayQueries";

const MAX_SCROLLBACK = 256 * 1024;

type PendingCreator = {
	client: SessionClient;
	timer: ReturnType<typeof setTimeout>;
	traceId?: string;
};

export type LinkRelayState = {
	node: string;
	sessions: SessionInfo[];
	lastSnapshot?: string;
	scrollback: Map<string, string>;
	pendingCreators: PendingCreator[];
	historyWaiters: ((sessions: HistoricalSession[]) => void)[];
	lastHistory?: HistoricalSession[];
	lastRequester?: SessionClient;
	pendingReplies: Map<string, SessionClient>;
	unrecognisedTypes: Set<string>;
	viewers: () => Set<SessionClient>;
	onSessionsChanged: () => void;
	onHistoryChanged: () => void;
	onLimits: (harness: HarnessKind | undefined, rateLimits: RateLimits) => void;
};

type RelayCallbacks = Pick<
	LinkRelayState,
	"viewers" | "onSessionsChanged" | "onHistoryChanged" | "onLimits"
>;

export function createRelayState(
	node: string,
	{ viewers, onSessionsChanged, onHistoryChanged, onLimits }: RelayCallbacks,
): LinkRelayState {
	return {
		node,
		sessions: [],
		scrollback: new Map(),
		pendingCreators: [],
		historyWaiters: [],
		pendingReplies: new Map(),
		unrecognisedTypes: new Set(),
		viewers,
		onSessionsChanged,
		onHistoryChanged,
		onLimits,
	};
}

export function broadcastToViewers(state: LinkRelayState, msg: object): void {
	broadcast(state.viewers(), msg);
}

function failPendingCreators(state: LinkRelayState, message: string): void {
	for (const { client, timer } of state.pendingCreators) {
		clearTimeout(timer);
		sendTo(client, { type: "error", message });
	}
	state.pendingCreators = [];
}

export function resetRelayState(state: LinkRelayState, reason: string): void {
	failPendingCreators(state, reason);
	for (const resolve of state.historyWaiters) resolve([]);
	state.historyWaiters = [];
	state.sessions = [];
	state.lastSnapshot = undefined;
	state.scrollback.clear();
}

export function replayLinkScrollback(
	state: LinkRelayState,
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
	state: LinkRelayState,
	sessionId: string,
	data: string,
): void {
	const next = (state.scrollback.get(sessionId) ?? "") + data;
	state.scrollback.set(
		sessionId,
		next.length > MAX_SCROLLBACK ? next.slice(-MAX_SCROLLBACK) : next,
	);
}
