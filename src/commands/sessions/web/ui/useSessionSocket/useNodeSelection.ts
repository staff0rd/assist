import { useCallback, useMemo, useState } from "react";
import type { NodesState } from "../types";

const STORAGE_KEY = "assist.sessions.node";

function readStoredNode(): string | null {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

function storeNode(node: string): void {
	try {
		localStorage.setItem(STORAGE_KEY, node);
	} catch {}
}

export type NodeSelection = {
	nodes: NodesState | null;
	names: string[];
	visible: boolean;
	selected: string | undefined;
	select: (node: string) => void;
};

export function useNodeSelection(nodes: NodesState | null): NodeSelection {
	const [stored, setStored] = useState(readStoredNode);
	const select = useCallback((node: string) => {
		setStored(node);
		storeNode(node);
	}, []);
	return useMemo(() => {
		const names = nodes
			? [nodes.local, ...nodes.links.map((link) => link.name)]
			: [];
		return {
			nodes,
			names,
			visible: names.length > 1,
			selected: stored && names.includes(stored) ? stored : nodes?.local,
			select,
		};
	}, [nodes, stored, select]);
}
