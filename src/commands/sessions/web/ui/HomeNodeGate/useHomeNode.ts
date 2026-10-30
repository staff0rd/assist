import { useCallback, useEffect, useState } from "react";
import { loadNodeStore, type NodeStore, nodeStore } from "./nodeStore";
import type { NodeHealth } from "./probeHealth";
import type { SavedNode } from "./SavedNode";
import { useHomeConnection } from "./useHomeConnection";

function upsert(nodes: SavedNode[], oldUrl: string, node: SavedNode) {
	const rest = nodes.filter((n) => n.url !== node.url || n.url === oldUrl);
	return rest.some((n) => n.url === oldUrl)
		? rest.map((n) => (n.url === oldUrl ? node : n))
		: [...rest, node];
}

export function useHomeNode() {
	const [store, setStore] = useState<NodeStore>();
	const homeUrl = store?.homeUrl ?? store?.nodes[0]?.url;
	const conn = useHomeConnection(homeUrl);

	useEffect(() => {
		loadNodeStore()
			.then(setStore)
			.catch(() => setStore({ nodes: [], homeUrl: undefined }));
	}, []);

	const update = useCallback((next: NodeStore) => {
		setStore(next);
		void nodeStore.saveNodes(next.nodes);
		if (next.homeUrl) void nodeStore.saveHomeUrl(next.homeUrl);
	}, []);

	const nodes = store?.nodes ?? [];

	const choose = (url: string) => update({ nodes, homeUrl: url });

	const saveNode = (oldUrl: string, node: SavedNode) =>
		update({
			nodes: upsert(nodes, oldUrl, node),
			homeUrl: oldUrl === homeUrl ? node.url : homeUrl,
		});

	const removeNode = (url: string) =>
		update({ nodes: nodes.filter((n) => n.url !== url), homeUrl });

	const connectFirstNode = (node: SavedNode, health: NodeHealth) => {
		conn.markConnected(node.url, health);
		update({ nodes: [node], homeUrl: node.url });
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
	};
}

export type HomeNodeApi = ReturnType<typeof useHomeNode>;
