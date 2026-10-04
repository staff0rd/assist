import type { Session } from "./createSession";
import { dismissSessionGated } from "./dismissSessionGated";
import { resumeWatcherAfterEscalation } from "./worktree/resumeWatcherAfterEscalation";

export function dismissAndResumeWatcher(
	sessions: Map<string, Session>,
	id: string,
	notify: () => void,
	restart: (watcherId: string) => void,
): void {
	const session = sessions.get(id);
	dismissSessionGated(sessions, id, notify);
	if (session) resumeWatcherAfterEscalation(sessions, session, restart);
}
