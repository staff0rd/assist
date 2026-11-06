import type { ActiveSelection } from "./ActiveSelection";
import { broadcast } from "./broadcast";
import type { ClientHub } from "./ClientHub";
import type { Session, SessionInfo } from "./createSession";
import { persistLiveSessions } from "./loadPersistedSessions";
import { toSessionInfo } from "./toSessionInfo";
import { isBusy } from "../shared/isBusy";

const activityCounts = new WeakMap<Map<string, Session>, number>();

export function broadcastSessions(
	sessions: Map<string, Session>,
	clients: ClientHub,
	linkedSessions: SessionInfo[] = [],
	active?: ActiveSelection,
): void {
	persistLiveSessions(sessions);
	const local = [...sessions.values()].map(toSessionInfo);
	const count =
		(activityCounts.get(sessions) ?? 0) + (local.some(isBusy) ? 1 : 0);
	activityCounts.set(sessions, count);
	const restartActivity = `${process.pid}:${count}`;
	const viewers = clients.viewers();
	broadcast(viewers, {
		type: "sessions",
		restartActivity,
		sessions: local.concat(linkedSessions),
		active: active?.toJSON() ?? {},
	});
	const peers = new Set([...clients].filter((c) => !viewers.has(c)));
	broadcast(peers, {
		type: "sessions",
		sessions: local,
		active: {},
		restartActivity,
	});
}
