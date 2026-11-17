import type { GitResult } from "./git";
import { tipSetFromRemote } from "./tipSetFromRemote";

// `gh pr checkout` fetches a fork or refs/pull head straight into the branch,
// leaving no remote-tracking ref, and a force-push leaves a branch created
// from the remote pointing at a tip no remote branch contains any more; the
// branch reflog is then the only local record that its tip came from a remote.
function tipFromRemote(reflog: string, remotes: string[]): boolean {
	const entries = reflog.split("\n").map((line) => {
		const trimmed = line.trim();
		const space = trimmed.indexOf(" ");
		return space === -1
			? { sha: trimmed, subject: "" }
			: { sha: trimmed.slice(0, space), subject: trimmed.slice(space + 1) };
	});
	const latest = entries[0];
	if (!latest?.sha) return false;
	return (
		tipSetFromRemote(latest.subject, remotes) ||
		entries.some(
			({ sha, subject }) => sha === latest.sha && /^fetch\b/.test(subject),
		)
	);
}

export function* tipOnRemote(): Generator<string[], boolean, GitResult> {
	const remoteBranches = yield ["branch", "-r", "--contains", "HEAD"];
	if (remoteBranches.ok && remoteBranches.out !== "") return true;
	const branch = yield ["symbolic-ref", "--quiet", "HEAD"];
	if (!branch.ok || !branch.out) return false;
	const reflog = yield ["reflog", "show", "--format=%H %gs", branch.out];
	if (!reflog.ok) return false;
	const remotes = yield ["remote"];
	return tipFromRemote(reflog.out, remotes.ok ? remotes.out.split("\n") : []);
}
