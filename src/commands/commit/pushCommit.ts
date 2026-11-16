import { execFileSync } from "node:child_process";

const HEADS_PREFIX = "refs/heads/";

type PushTarget = { remote: string; branch: string; setUpstream: boolean };

export function pushCommit(trunkMode: boolean): void {
	const target = pushTargetForRenamedUpstream(trunkMode);
	const args = target
		? [
				"push",
				...(target.setUpstream ? ["--set-upstream"] : []),
				target.remote,
				`HEAD:${target.branch}`,
			]
		: ["push"];
	execFileSync("git", args, { stdio: "inherit" });
}

function pushTargetForRenamedUpstream(trunkMode: boolean): PushTarget | null {
	const branch = gitOrNull("symbolic-ref", "--short", "HEAD");
	if (!branch) return null;
	const remote = gitOrNull("config", "--get", `branch.${branch}.remote`);
	const merge = gitOrNull("config", "--get", `branch.${branch}.merge`);
	if (!remote || !merge) return null;
	const upstream = merge.startsWith(HEADS_PREFIX)
		? merge.slice(HEADS_PREFIX.length)
		: merge;
	if (upstream === branch) return null;
	return trunkMode
		? landOnTrackedMainline(remote, upstream)
		: raiseOwnRemoteBranch(remote, branch);
}

function landOnTrackedMainline(remote: string, upstream: string): PushTarget {
	return { remote, branch: upstream, setUpstream: false };
}

function raiseOwnRemoteBranch(remote: string, branch: string): PushTarget {
	return { remote, branch, setUpstream: true };
}

function gitOrNull(...args: string[]): string | null {
	try {
		return (
			execFileSync("git", args, {
				encoding: "utf8",
				stdio: ["pipe", "pipe", "pipe"],
			}).trim() || null
		);
	} catch {
		return null;
	}
}
