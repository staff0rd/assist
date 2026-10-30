import type { NodesState } from "../../types";

type PortTarget = { url: string; remote: boolean };

export function portUrl(
	port: number,
	node: string | undefined,
	nodes: NodesState | null,
): PortTarget {
	const link =
		node && node !== nodes?.local
			? nodes?.links.find((l) => l.name === node)
			: undefined;
	if (!link) return { url: `http://localhost:${port}`, remote: false };
	return { url: `http://${new URL(link.url).hostname}:${port}`, remote: true };
}
