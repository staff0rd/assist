export function createArgsFor(
	node?: string,
	open?: boolean,
	model?: string,
): [string?, boolean?, string?] {
	if (model) return [node, open, model];
	if (open) return [node, true];
	return node ? [node] : [];
}
