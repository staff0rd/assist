import { useMemo } from "react";
import type { HistoricalSession, SessionInfo } from "../../../types";
import type { RepoSelection } from "../../../useRepoSelectionContext";
import type { NodeSelection } from "../../../useSessionSocket/useNodeSelection";
import { deriveWorktree } from "./useRepoSelection/deriveWorktree";
import { mergeRepos, preferredClone } from "./useRepoSelection/mergeRepos";
import { nodeKey } from "./useRepoSelection/nodeKey";
import { useRepoLookups } from "./useRepoSelection/useRepoLookups";
import { useRetargetOnMachineChange } from "./useRepoSelection/useRetargetOnMachineChange";
import { useSelectedRepo } from "./useRepoSelection/useSelectedRepo";
import { useSyncRepoToActiveCard } from "./useRepoSelection/useSyncRepoToActiveCard";

export function useRepoSelection(
	currentCwd: string,
	history: HistoricalSession[],
	activeId: string | null,
	sessions: SessionInfo[],
	nodeSelection: NodeSelection,
): RepoSelection {
	const localNode = nodeSelection.nodes?.local;
	const machine = nodeKey(nodeSelection.selected, localNode);
	const merged = useMemo(
		() => mergeRepos(currentCwd, history),
		[currentCwd, history],
	);
	const { selectedCwd, selectedNode, setSelectedCwd } = useSelectedRepo(
		currentCwd,
		merged,
		machine,
		localNode,
	);
	useSyncRepoToActiveCard(activeId, sessions, history, setSelectedCwd);
	useRetargetOnMachineChange(machine, merged, selectedCwd, setSelectedCwd);
	const { cloneOn, originOf } = useRepoLookups(merged, localNode);

	const repos = useMemo(
		() => merged.map((repo) => preferredClone(repo, machine)),
		[merged, machine],
	);
	const { cwd: worktreeCwd, node: worktreeNode } = deriveWorktree(
		activeId,
		sessions,
		history,
		{ cwd: selectedCwd, node: selectedNode },
	);

	// Stable identity so RepoSelectionContext consumers only re-render when
	// the selection actually changes, not on every socket state update
	return useMemo(
		() => ({
			repos,
			selectedCwd,
			selectedNode,
			worktreeCwd,
			worktreeNode,
			setSelectedCwd,
			cloneOn,
			originOf,
		}),
		[
			repos,
			selectedCwd,
			selectedNode,
			worktreeCwd,
			worktreeNode,
			setSelectedCwd,
			cloneOn,
			originOf,
		],
	);
}
