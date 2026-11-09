import type { NodeLink } from "./NodeLink";

export function relayLinkUserActivity(
	links: Map<string, NodeLink>,
	nodes: unknown,
): void {
	if (!Array.isArray(nodes)) return;
	for (const node of new Set(nodes))
		if (typeof node === "string") links.get(node)?.relayUserActivity();
}
