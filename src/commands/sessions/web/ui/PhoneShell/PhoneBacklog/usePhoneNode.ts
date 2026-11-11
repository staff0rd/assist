import { useState } from "react";
import type { SessionSocket } from "../../useSessionSocket";
import type { BacklogItemScope } from "./backlogItemPath";

export function usePhoneNode(socket: SessionSocket, scope: BacklogItemScope) {
	const { names, visible } = socket.nodeSelection;
	const localNode = socket.nodes?.local;
	const [pickedNode, setPickedNode] = useState(scope.node ?? localNode);
	const node =
		pickedNode && names.includes(pickedNode) ? pickedNode : localNode;
	return {
		node,
		remote: node !== localNode ? node : undefined,
		setNode: setPickedNode,
		nodes: visible ? names : [],
		links: socket.nodes?.links ?? [],
	};
}
