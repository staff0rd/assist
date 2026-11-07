import { changedPaths } from "./changedPaths";
import { readBuiltVersion } from "./readBuiltVersion";
import { readRecentCommits } from "./readRecentCommits";
import { renderWatchReport } from "./renderWatchReport";
import { restartAdvice } from "./restartAdvice";
import { syncAdvice } from "./syncAdvice";

export function buildWatchReport(from?: string, cwd?: string): string {
	const changed = from ? changedPaths(from, cwd) : [];

	return renderWatchReport({
		version: readBuiltVersion(cwd),
		commits: readRecentCommits(from, cwd),
		pulled: Boolean(from),
		restarts: restartAdvice(changed),
		syncs: syncAdvice(changed),
	});
}
