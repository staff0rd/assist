export function createArgsFor(
	node?: string,
	open?: boolean,
	model?: string,
	yolo?: boolean,
): [string?, boolean?, string?, boolean?] {
	if (yolo) return [node, open, model, true];
	if (model) return [node, open, model];
	if (open) return [node, true];
	return node ? [node] : [];
}
