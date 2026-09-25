import type { Session } from "../types";
import { canonicalTreePath } from "./canonicalTreePath";

export function liveWatcherFor(
	sessions: Map<string, Session>,
	clone?: string,
): Session | undefined {
	for (const session of sessions.values())
		if (
			session.watcher === true &&
			session.cwd !== undefined &&
			(clone === undefined || canonicalTreePath(session.cwd) === clone) &&
			session.status !== "stopped" &&
			session.status !== "error"
		)
			return session;
	return undefined;
}
