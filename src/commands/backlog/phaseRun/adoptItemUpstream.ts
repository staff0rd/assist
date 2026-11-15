import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { phaseGit } from "./phaseGit";
import { phaseUpstream } from "./phaseUpstream";

/** Make this phase's worktree branch track the same remote branch as the run's item tree, so its work pushes there. */
export function adoptItemUpstream(itemTree: string, label: string): void {
	const upstream = phaseUpstream(itemTree);
	if (!upstream) {
		appendDaemonLog(
			`${label}: item tree ${itemTree} tracks no remote branch; landing stays local`,
		);
		return;
	}
	const set = phaseGit(["branch", "--set-upstream-to", upstream.ref]);
	appendDaemonLog(
		set.ok
			? `${label}: worktree branch now tracks ${upstream.ref}`
			: `${label}: could not track ${upstream.ref}; landing stays local`,
	);
}
