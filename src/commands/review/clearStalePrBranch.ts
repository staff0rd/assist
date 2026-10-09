import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { gitSyncOrNull, gitSyncResult } from "../sessions/daemon/worktree/git";

export type StalePrBranch = "absent" | "cleared" | "local-work";

const tipSetFromRemote = /^branch: (Created from|Reset to)|: Fast-forward$/;

function holdsLocalWork(cwd: string, ref: string): boolean {
	const unpushed = gitSyncOrNull(cwd, [
		"rev-list",
		"--count",
		ref,
		"--not",
		"--remotes",
	]);
	if (unpushed === "0") return false;
	const lastMove = gitSyncOrNull(cwd, [
		"reflog",
		"show",
		"-n1",
		"--format=%gs",
		ref,
	]);
	return !lastMove || !tipSetFromRemote.test(lastMove);
}

export function clearStalePrBranch(cwd: string, branch: string): StalePrBranch {
	const ref = `refs/heads/${branch}`;
	if (!gitSyncOrNull(cwd, ["rev-parse", "--verify", "--quiet", ref]))
		return "absent";
	if (holdsLocalWork(cwd, ref)) return "local-work";
	if (!gitSyncResult(cwd, ["branch", "-D", branch]).ok) return "absent";
	appendDaemonLog(`cleared stale local pr branch ${branch} in ${cwd}`);
	return "cleared";
}
