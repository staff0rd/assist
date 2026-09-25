const SKIP_SELECTOR = "[data-preview-skip]";

export function skipsSelection(node: Node | null): boolean {
	const element =
		node instanceof Element ? node : (node?.parentElement ?? null);
	return element !== null && element.closest(SKIP_SELECTOR) !== null;
}

export function textWalker(root: Node): TreeWalker {
	return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode: (node) =>
			skipsSelection(node)
				? NodeFilter.FILTER_REJECT
				: NodeFilter.FILTER_ACCEPT,
	});
}
