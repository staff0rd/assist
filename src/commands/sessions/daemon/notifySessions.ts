import type { ActiveSelection } from "./ActiveSelection";
import { broadcastSessions } from "./broadcastSessions";
import type { ClientHub } from "./ClientHub";
import type { Session, SessionInfo } from "./createSession";
import type { OnStatusChange } from "./types";
import { wakeParkedRuns } from "./wakeParkedRuns";

/** Wake any parked run whose phases have all ended, then broadcast and persist the session list. */
export function notifySessions(
	sessions: Map<string, Session>,
	clients: ClientHub,
	onStatusChange: OnStatusChange,
	links: { sessions: () => SessionInfo[] },
	active: ActiveSelection,
): void {
	wakeParkedRuns(sessions, clients, onStatusChange);
	broadcastSessions(sessions, clients, links.sessions(), active);
}
