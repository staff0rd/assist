import type { Session } from "./createSession";
import type { SessionManager } from "./SessionManager";

export function findSession(
	manager: SessionManager,
	id: string,
): Session | undefined {
	let found: Session | undefined;
	manager.update((sessions) => {
		found = sessions.get(id);
		return false;
	});
	return found;
}
