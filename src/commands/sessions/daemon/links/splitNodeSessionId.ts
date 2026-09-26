export function toNodeSessionId(node: string, id: string): string {
	return `${node}:${id}`;
}

export function splitNodeSessionId(
	id: string,
): { node: string; id: string } | undefined {
	const at = id.indexOf(":");
	if (at <= 0) return undefined;
	return { node: id.slice(0, at), id: id.slice(at + 1) };
}
