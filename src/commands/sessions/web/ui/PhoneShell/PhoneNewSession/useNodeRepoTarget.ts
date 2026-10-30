import { useMemo } from "react";
import { mergeRepos } from "../../mergeRepos";
import { nodeKey } from "../../nodeKey";
import type { SessionSocket } from "../../useSessionSocket";
import { nodeRepos, resolveNodeCwd } from "./nodeRepos";

export function useNodeRepoTarget(
	socket: SessionSocket,
	pickedNode: string | undefined,
	pickedCwd: string | undefined,
) {
	const { names } = socket.nodeSelection;
	const localNode = socket.nodes?.local;
	const node =
		pickedNode && names.includes(pickedNode) ? pickedNode : localNode;
	const key = nodeKey(node, localNode);
	const merged = useMemo(
		() => mergeRepos(socket.currentCwd, socket.history),
		[socket.currentCwd, socket.history],
	);
	return {
		node,
		cwd: resolveNodeCwd(merged, key, pickedCwd),
		repos: nodeRepos(merged, key),
	};
}
