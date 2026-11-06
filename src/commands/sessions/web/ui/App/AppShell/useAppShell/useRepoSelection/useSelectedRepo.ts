import { useCallback, useEffect, useState } from "react";
import type { MergedRepo } from "../../../../mergeRepos";
import { nodeKey } from "../../../../nodeKey";
import { type RepoPick, resolveSelectedNode } from "./resolveSelectedNode";
import { readStoredRepoPick } from "./readStoredRepoPick";
import { storeRepoPick } from "./storeRepoPick";

export function useSelectedRepo(
	currentCwd: string,
	merged: MergedRepo[],
	machine: string,
	localNode: string | undefined,
) {
	const [pick, setPick] = useState<RepoPick>(
		() => readStoredRepoPick() ?? { cwd: currentCwd },
	);
	const setSelectedCwd = useCallback(
		(cwd: string, node?: string, origin?: string) => {
			const next = { cwd, node, origin };
			setPick(next);
			storeRepoPick(next);
		},
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
		selectedPick: { cwd: pick.cwd, node, origin: pick.origin },
		setSelectedCwd,
	};
}
