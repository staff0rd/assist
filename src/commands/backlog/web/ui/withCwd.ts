import { withNode } from "../../../sessions/web/ui/withNode";

export function withCwd(url: string, cwd?: string, node?: string): string {
	if (!cwd) return withNode(url, node);
	const separator = url.includes("?") ? "&" : "?";
	return withNode(`${url}${separator}cwd=${encodeURIComponent(cwd)}`, node);
}
