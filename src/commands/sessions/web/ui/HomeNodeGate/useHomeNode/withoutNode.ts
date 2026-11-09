import type { NodeStore } from "../nodeStore";

export function withoutNode(store: NodeStore, url: string): NodeStore {
	const nodes = store.nodes.filter((n) => n.url !== url);
	const homeUrl = store.homeUrl === url ? nodes[0]?.url : store.homeUrl;
	return { nodes, homeUrl };
}
