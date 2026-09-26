import type { SessionInfo } from "../createSession";
import type { LinkRelayState } from "./LinkRelayState";
import { toNodeSessionId } from "./splitNodeSessionId";

export function relayLinkSessions(
	state: LinkRelayState,
	msg: Record<string, unknown>,
): void {
	const snapshot = JSON.stringify(msg.sessions ?? []);
	if (snapshot === state.lastSnapshot) return;
	state.lastSnapshot = snapshot;
	const ns = (id: string) => toNodeSessionId(state.node, id);
	state.sessions = ((msg.sessions as SessionInfo[]) ?? []).map((s) => ({
		...s,
		id: ns(s.id),
		launchedFrom: s.launchedFrom ? ns(s.launchedFrom) : undefined,
		node: state.node,
	}));
	const live = new Set(state.sessions.map((s) => s.id));
	for (const id of state.scrollback.keys())
		if (!live.has(id)) state.scrollback.delete(id);
	state.onSessionsChanged();
}
