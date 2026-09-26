export function withNode(url: string, node?: string): string {
	if (!node) return url;
	const separator = url.includes("?") ? "&" : "?";
	return `${url}${separator}node=${encodeURIComponent(node)}`;
}
