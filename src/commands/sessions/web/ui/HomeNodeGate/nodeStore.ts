import { Preferences } from "@capacitor/preferences";
import { defaultNodeName } from "./defaultNodeName";
import type { SavedNode } from "./SavedNode";

const NODES_KEY = "savedNodes";
const HOME_NODE_KEY = "homeNodeUrl";

export type NodeStore = { nodes: SavedNode[]; homeUrl: string | undefined };

function parseNodes(raw: string | null): SavedNode[] | undefined {
	if (!raw) return undefined;
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return undefined;
		return parsed.filter(
			(n): n is SavedNode =>
				typeof n?.name === "string" && typeof n?.url === "string",
		);
	} catch {
		return undefined;
	}
}

function seedFromLegacyHomeUrl(homeUrl: string | undefined): SavedNode[] {
	return homeUrl ? [{ name: defaultNodeName(homeUrl), url: homeUrl }] : [];
}

export async function loadNodeStore(): Promise<NodeStore> {
	const [nodes, home] = await Promise.all([
		Preferences.get({ key: NODES_KEY }),
		Preferences.get({ key: HOME_NODE_KEY }),
	]);
	const homeUrl = home.value ?? undefined;
	return {
		nodes: parseNodes(nodes.value) ?? seedFromLegacyHomeUrl(homeUrl),
		homeUrl,
	};
}

export const nodeStore = {
	saveNodes: (nodes: SavedNode[]) =>
		Preferences.set({ key: NODES_KEY, value: JSON.stringify(nodes) }),
	saveHomeUrl: (url: string) =>
		Preferences.set({ key: HOME_NODE_KEY, value: url }),
};
