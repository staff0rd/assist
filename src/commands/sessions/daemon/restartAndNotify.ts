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
	fresh = false,
): RestartResult {
	const result = restartManagedSession(
		sessions,
		id,
		clients,
		onStatusChange,
		fresh,
	);
	if (result.ok) notify();
	return result;
}
