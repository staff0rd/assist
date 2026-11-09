import type { NodesState } from "../../types";

type PortTarget = { url: string; remote: boolean };

function normalisePath(path: string | undefined): string {
	if (!path) return "";
	return path.startsWith("/") ? path : `/${path}`;
}

export function portUrl(
	port: number,
	node: string | undefined,
	nodes: NodesState | null,
	protocol: "http" | "https" = "http",
	path?: string,
): PortTarget {
	const link =
		node && node !== nodes?.local
			? nodes?.links.find((l) => l.name === node)
			: undefined;
	const suffix = normalisePath(path);
	if (!link)
		return { url: `${protocol}://localhost:${port}${suffix}`, remote: false };
	return {
		url: `${protocol}://${new URL(link.url).hostname}:${port}${suffix}`,
		remote: true,
	};
}
