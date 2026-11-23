import { useCallback, useMemo } from "react";
import { findRepo, LOCAL_NODE, mergeRepos } from "../../mergeRepos";
import { nodeKey } from "../../nodeKey";
import type { SessionSocket } from "../../useSessionSocket";

export function useSocketCloneOn({
	currentCwd,
	history,
	cloneBaseRepos,
	nodes,
}: SessionSocket) {
	const localNode = nodes?.local;
	const merged = useMemo(
		() => mergeRepos(currentCwd, history, cloneBaseRepos),
		[currentCwd, history, cloneBaseRepos],
	);
	return useCallback(
		(cwd: string, node: string | undefined) => {
			const key = nodeKey(node, localNode);
			const repo = findRepo(merged, cwd);
			if (repo) return repo.clones[key];
			return key === LOCAL_NODE ? cwd : undefined;
		},
		[merged, localNode],
	);
}
