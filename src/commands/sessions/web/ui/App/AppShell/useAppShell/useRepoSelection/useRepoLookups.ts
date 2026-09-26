import { useCallback } from "react";
import { findRepo, LOCAL_NODE, type MergedRepo } from "./mergeRepos";
import { nodeKey } from "./nodeKey";

export function useRepoLookups(
	merged: MergedRepo[],
	localNode: string | undefined,
) {
	const cloneOn = useCallback(
		(cwd: string, node: string | undefined) => {
			const key = nodeKey(node, localNode);
			const repo = findRepo(merged, cwd);
			if (!repo) return key === LOCAL_NODE ? cwd : undefined;
			return repo.clones[key];
		},
		[merged, localNode],
	);
	const originOf = useCallback(
		(cwd: string) => findRepo(merged, cwd)?.origin,
		[merged],
	);
	return { cloneOn, originOf };
}
