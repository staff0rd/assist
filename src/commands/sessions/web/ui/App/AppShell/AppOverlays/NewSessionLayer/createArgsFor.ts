export function createArgsFor(
	node?: string,
	open?: boolean,
): [string?, boolean?] {
	if (open) return [node, true];
	return node ? [node] : [];
}
