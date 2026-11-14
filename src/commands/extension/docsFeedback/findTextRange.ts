function textNodes(root: Node): Text[] {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const nodes: Text[] = [];
	while (walker.nextNode()) nodes.push(walker.currentNode as Text);
	return nodes;
}

function pointAt(nodes: Text[], offset: number, atEnd: boolean) {
	let start = 0;
	for (const node of nodes) {
		const end = start + node.data.length;
		if (offset < end || (atEnd && offset === end))
			return { node, offset: offset - start };
		start = end;
	}
	return undefined;
}

function textPattern(text: string): RegExp {
	const escaped = text.trim().replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
	return new RegExp(escaped.replace(/\s+/g, String.raw`\s+`));
}

export function findTextRange(root: Node, text: string): Range | undefined {
	if (!text.trim()) return undefined;
	const nodes = textNodes(root);
	const match = textPattern(text).exec(nodes.map((n) => n.data).join(""));
	if (!match) return undefined;
	const start = pointAt(nodes, match.index, false);
	const end = pointAt(nodes, match.index + match[0].length, true);
	if (!start || !end) return undefined;
	const range = document.createRange();
	range.setStart(start.node, start.offset);
	range.setEnd(end.node, end.offset);
	return range;
}
