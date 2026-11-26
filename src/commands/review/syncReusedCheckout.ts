import chalk from "chalk";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { gitSyncOrNull, gitSyncResult } from "../sessions/daemon/worktree/git";
import { branchHoldsLocalWork } from "./branchHoldsLocalWork";
import { reinstallChangedDeps } from "./reinstallChangedDeps";

function warnDiffers(number: string, headRef: string, why: string): void {
	console.warn(
		chalk.yellow(
			`${headRef} ${why}; reviewing it as it is, which may differ from PR #${number}'s head.`,
		),
	);
	appendDaemonLog(
		`pr #${number} reused checkout ${process.cwd()} left as is: ${why}`,
	);
}

function blocker(cwd: string, ref: string): string | null {
	const status = gitSyncResult(cwd, ["status", "--porcelain"]);
	if (!status.ok || status.out !== "") return "has uncommitted changes";
	if (branchHoldsLocalWork(cwd, ref))
		return "has local commits that are not on the remote";
	return null;
}

export async function syncReusedCheckout(
	number: string,
	headRef: string,
	source: { remote: string; ref: string },
): Promise<void> {
	const cwd = process.cwd();
	const ref = `refs/heads/${headRef}`;
	const why = blocker(cwd, ref);
	if (why) return warnDiffers(number, headRef, why);
	const before = gitSyncOrNull(cwd, ["rev-parse", "HEAD"]);
	// Fetching straight into the checked-out branch records a `fetch` reflog
	// entry, which the durability check reads as a tip taken from the remote.
	const fetch = ["fetch", "--quiet", "--update-head-ok", source.remote];
	if (!gitSyncResult(cwd, [...fetch, `+${source.ref}:${ref}`]).ok)
		return warnDiffers(number, headRef, "could not be fetched");
	if (!gitSyncResult(cwd, ["reset", "--quiet", "--hard"]).ok)
		return warnDiffers(number, headRef, "could not be reset");
	const after = gitSyncOrNull(cwd, ["rev-parse", "HEAD"]);
	if (after === before) return;
	console.log(`Moved ${headRef} to PR #${number}'s current head.`);
	appendDaemonLog(
		`pr #${number} reused checkout ${cwd} moved ${headRef} from ${before} to ${after}`,
	);
	await reinstallChangedDeps(cwd, before);
}
