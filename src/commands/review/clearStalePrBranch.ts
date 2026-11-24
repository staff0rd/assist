import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { gitSyncOrNull, gitSyncResult } from "../sessions/daemon/worktree/git";
import { branchHoldsLocalWork } from "./branchHoldsLocalWork";

export type StalePrBranch = "absent" | "cleared" | "local-work";

export function clearStalePrBranch(cwd: string, branch: string): StalePrBranch {
	const ref = `refs/heads/${branch}`;
	const tip = gitSyncOrNull(cwd, ["rev-parse", "--verify", "--quiet", ref]);
	if (!tip) return "absent";
	if (branchHoldsLocalWork(cwd, ref)) return "local-work";
	if (!gitSyncResult(cwd, ["branch", "-D", branch]).ok) return "absent";
	appendDaemonLog(
		`cleared stale local pr branch ${branch} at ${tip} in ${cwd}`,
	);
	return "cleared";
}
