import type { Session } from "../types";
import { canonicalTreePath } from "./canonicalTreePath";
import { liveWatcherFor } from "./liveWatcherFor";
import { resolveClone } from "./resolveClone";

export function orphanedWatcherFor(
	sessions: Map<string, Session>,
	dismissed: Session,
): { watcher: Session; clone: string } | undefined {
	if (dismissed.watcher === true || !dismissed.cwd) return undefined;
	if (!liveWatcherFor(sessions)) return undefined;
	const known = dismissed.worktree?.clone ?? dismissed.releasedFromClone;
	const clone = known ? canonicalTreePath(known) : resolveClone(dismissed.cwd);
	const watcher = liveWatcherFor(sessions, clone);
	if (!watcher) return undefined;
	const kept = [...sessions.values()].some(
		(s) =>
			s.watcher !== true &&
			s.cwd !== undefined &&
			resolveClone(s.cwd) === clone,
	);
	return kept ? undefined : { watcher, clone };
}
