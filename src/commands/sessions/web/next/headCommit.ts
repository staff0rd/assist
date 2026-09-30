import type { GhPeerPrNode } from "./types";

export function headCommit(node: GhPeerPrNode) {
	return node.commits?.nodes?.[0]?.commit ?? null;
}
