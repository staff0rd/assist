import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { phaseGit } from "./phaseGit";
import { phaseUpstream } from "./phaseUpstream";

/** Drop a cancelled phase's unlanded work, so the daemon reaps its worktree instead of keeping it for unpushed commits. */
export function discardCancelledPhase(
	itemTree: string,
	label: string,
	cwd?: string,
): void {
	const target =
		phaseUpstream(cwd)?.ref ?? phaseGit(["rev-parse", "HEAD"], itemTree).out;
	if (!target) return;
	const reset = phaseGit(["reset", "--hard", "--quiet", target], cwd);
	const clean = phaseGit(["clean", "-fdq"], cwd);
	appendDaemonLog(
		reset.ok && clean.ok
			? `${label}: discarded its unlanded work (reset to ${target})`
			: `${label}: could not discard its unlanded work; its worktree is kept`,
	);
}
