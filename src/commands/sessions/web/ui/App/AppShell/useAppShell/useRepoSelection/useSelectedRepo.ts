import { useCallback, useEffect, useState } from "react";
import type { MergedRepo } from "./mergeRepos";
import { nodeKey } from "./nodeKey";
import {
	type RepoPick,
	resolveSelectedNode,
} from "./useSelectedRepo/resolveSelectedNode";

export function useSelectedRepo(
	currentCwd: string,
	merged: MergedRepo[],
	machine: string,
	localNode: string | undefined,
) {
	const [pick, setPick] = useState<RepoPick>({ cwd: currentCwd });
	const setSelectedCwd = useCallback(
		(cwd: string, node?: string) => setPick({ cwd, node }),
		[],
	);

	useEffect(() => {
		if (currentCwd && !pick.cwd) setPick({ cwd: currentCwd });
	}, [currentCwd, pick.cwd]);

	const node = resolveSelectedNode(
		merged,
		{
			cwd: pick.cwd,
			node: pick.node === undefined ? undefined : nodeKey(pick.node, localNode),
		},
		machine,
	);
	return {
		selectedCwd: pick.cwd,
		selectedNode: node || undefined,
		setSelectedCwd,
	};
}
