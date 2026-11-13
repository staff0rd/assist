import type { GitResult } from "./git";

// `gh pr checkout` fetches a fork or refs/pull head straight into the branch,
// leaving no remote-tracking ref; the branch reflog's fetch entry is the only
// local record that its tip is on the remote.
function tipWasFetched(reflog: string): boolean {
	const entries = reflog.split("\n").map((line) => line.trim().split(" "));
	const tip = entries[0]?.[0];
	return (
		!!tip && entries.some(([sha, action]) => sha === tip && action === "fetch")
	);
}

export function* tipOnRemote(): Generator<string[], boolean, GitResult> {
	const remoteBranches = yield ["branch", "-r", "--contains", "HEAD"];
	if (remoteBranches.ok && remoteBranches.out !== "") return true;
	const branch = yield ["symbolic-ref", "--quiet", "HEAD"];
	if (!branch.ok || !branch.out) return false;
	const reflog = yield ["reflog", "show", "--format=%H %gs", branch.out];
	return reflog.ok && tipWasFetched(reflog.out);
}
