import { daemonLog } from "./daemonLog";
import { describePersistedSession } from "./describePersistedSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { underTempRoot } from "./worktree/underTempRoot";

function droppedReason(entry: PersistedSession): string | undefined {
	if (underTempRoot(entry.cwd)) return "lies outside any project root";
	if (entry.watcher === true)
		return "is a retired watcher session (the daemon now runs the assist auto-update loop itself)";
	return undefined;
}

export function dropUnrestorableSessions(
	persisted: PersistedSession[],
): PersistedSession[] {
	return persisted.filter((entry) => {
		const reason = droppedReason(entry);
		if (!reason) return true;
		daemonLog(
			`persisted session ${describePersistedSession(entry)} ${reason}; dropped rather than restored`,
		);
		return false;
	});
}
