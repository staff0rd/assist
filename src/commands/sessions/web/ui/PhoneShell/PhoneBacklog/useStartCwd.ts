import { useMemo } from "react";
import { mergeRepos } from "../../mergeRepos";
import { nodeKey } from "../../nodeKey";
import type { SessionSocket } from "../../useSessionSocket";
import type { BacklogItemScope } from "./backlogItemPath";
import { resolveStartCwd } from "./resolveStartCwd";

export function useStartCwd(
	socket: SessionSocket,
	origin: string | undefined,
	scope: BacklogItemScope,
	node: string | undefined,
): string | undefined {
	const localNode = socket.nodes?.local;
	const merged = useMemo(
		() => mergeRepos(socket.currentCwd, socket.history),
		[socket.currentCwd, socket.history],
	);
	return resolveStartCwd(
		merged,
		{ cwd: scope.cwd, origin, key: nodeKey(scope.node, localNode) },
		nodeKey(node, localNode),
	);
}
