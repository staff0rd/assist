import type { SessionClient } from "./broadcast";
import {
	type RestartResult,
	restartManagedSession,
} from "./restartManagedSession";
import type { OnStatusChange, Session } from "./types";

export function restartAndNotify(
	sessions: Map<string, Session>,
	id: string,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	notify: () => void,
): RestartResult {
	const result = restartManagedSession(sessions, id, clients, onStatusChange);
	if (result.ok) notify();
	return result;
}
