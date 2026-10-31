import type { SessionClient } from "../broadcast";

type PinNotificationTarget =
	| { kind: "local"; reason: string }
	| { kind: "peer"; node: string; peer: SessionClient };

export function pinNotificationTarget(
	viewerNode: string | undefined,
	localNode: string,
	peerFor: (node: string) => SessionClient | undefined,
): PinNotificationTarget {
	if (!viewerNode) return { kind: "local", reason: "has no active viewer" };
	if (viewerNode === localNode)
		return { kind: "local", reason: "is controlled from this node" };
	const peer = peerFor(viewerNode);
	if (!peer)
		return {
			kind: "local",
			reason: `is controlled from ${viewerNode}, which has no peer link here`,
		};
	return { kind: "peer", node: viewerNode, peer };
}
