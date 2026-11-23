import { tryGit } from "../../shared/tryGit";

const HEADS_PREFIX = "refs/heads/";

export type PushTarget = {
	remote: string;
	branch: string;
	setUpstream: boolean;
};

export function pushTargetForRenamedUpstream(
	trunkMode: boolean,
): PushTarget | null {
	const branch = tryGit("symbolic-ref", "--short", "HEAD");
	if (!branch) return null;
	const remote = tryGit("config", "--get", `branch.${branch}.remote`);
	const merge = tryGit("config", "--get", `branch.${branch}.merge`);
	if (!remote || !merge) return null;
	const upstream = merge.startsWith(HEADS_PREFIX)
		? merge.slice(HEADS_PREFIX.length)
		: merge;
	if (upstream === branch) return null;
	return trunkMode
		? { remote, branch: upstream, setUpstream: false }
		: { remote, branch, setUpstream: true };
}
