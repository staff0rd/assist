import { useCallback } from "react";
import { type NodeStore, nodeStore } from "./nodeStore";
import type { NodeHealth } from "./probeHealth";
import type { SavedNode } from "./SavedNode";
import { useHomeConnection } from "./useHomeConnection";
import { useLoadedNodeStore } from "./useHomeNode/useLoadedNodeStore";
import { upsert } from "./useHomeNode/upsert";
import { withoutNode } from "./useHomeNode/withoutNode";

export function useHomeNode() {
	const [store, setStore] = useLoadedNodeStore();
	const homeUrl = store?.homeUrl ?? store?.nodes[0]?.url;
	const conn = useHomeConnection(homeUrl);

	const update = useCallback(
		(next: NodeStore) => {
			setStore(next);
			void nodeStore.saveNodes(next.nodes);
			void nodeStore.saveHomeUrl(next.homeUrl);
		},
		[setStore],
	);

	const nodes = store?.nodes ?? [];

	const choose = (url: string) => update({ nodes, homeUrl: url });

	const saveNode = (oldUrl: string, node: SavedNode) =>
		update({
			nodes: upsert(nodes, oldUrl, node),
			homeUrl: oldUrl === homeUrl ? node.url : homeUrl,
		});

	const removeNode = (url: string) =>
		update(withoutNode({ nodes, homeUrl }, url));

	const connectFirstNode = (node: SavedNode, health: NodeHealth) => {
		conn.markConnected(node.url, health);
		update({ nodes: [node], homeUrl: node.url });
	};

	const adoptNode = (node: SavedNode, health: NodeHealth) => {
		conn.markConnected(node.url, health);
		update({ nodes: upsert(nodes, node.url, node), homeUrl: node.url });
	};

	return {
		loaded: !!store,
		nodes,
		home: nodes.find((n) => n.url === homeUrl),
		...conn,
		choose,
		saveNode,
		removeNode,
		connectFirstNode,
		adoptNode,
	};
}

export type HomeNodeApi = ReturnType<typeof useHomeNode>;
