type AdfNode = {
	type: string;
	text?: string;
	content?: AdfNode[];
	attrs?: Record<string, unknown>;
	marks?: { type: string }[];
};

function renderInline(node: AdfNode): string {
	const text = node.text ?? "";
	if (node.marks?.some((m) => m.type === "code")) return `\`${text}\``;
	return text;
}

function renderChildren(node: AdfNode, indent: number): string {
	return renderNodes(node.content ?? [], indent);
}

function renderOrderedList(node: AdfNode, indent: number): string {
	let counter = 0;
	return (node.content ?? [])
		.map((item) => {
			counter++;
			return renderListItem(item, indent, `${counter}.`);
		})
		.join("\n");
}

function renderBulletList(node: AdfNode, indent: number): string {
	return (node.content ?? [])
		.map((item) => renderListItem(item, indent, "-"))
		.join("\n");
}

function renderHeading(node: AdfNode, indent: number): string {
	const level = (node.attrs?.level as number) ?? 1;
	return `${"#".repeat(level)} ${renderChildren(node, indent)}`;
}

type NodeRenderer = (node: AdfNode, indent: number) => string;

const renderers: Record<string, NodeRenderer> = {
	text: (node) => renderInline(node),
	paragraph: renderChildren,
	orderedList: renderOrderedList,
	bulletList: renderBulletList,
	listItem: (node, indent) => renderListItem(node, indent, "-"),
	heading: renderHeading,
	doc: renderChildren,
};

function renderNode(node: AdfNode, indent: number): string {
	const renderer = renderers[node.type];
	if (renderer) return renderer(node, indent);
	return node.content ? renderChildren(node, indent) : "";
}

function renderNodes(nodes: AdfNode[], indent: number): string {
	return nodes.map((node) => renderNode(node, indent)).join("");
}

function isListNode(node: AdfNode): boolean {
	return node.type === "orderedList" || node.type === "bulletList";
}

function renderListChild(
	child: AdfNode,
	indent: number,
	pad: string,
	marker: string,
	isFirst: boolean,
): string {
	if (isListNode(child)) return renderNodes([child], indent + 1);
	if (child.type !== "paragraph") return renderNode(child, indent);
	const text = renderChildren(child, indent);
	return isFirst ? `${pad}${marker} ${text}` : `${pad}  ${text}`;
}

function renderListItem(node: AdfNode, indent: number, marker: string): string {
	const pad = "  ".repeat(indent);
	return (node.content ?? [])
		.map((child, i) => renderListChild(child, indent, pad, marker, i === 0))
		.join("\n");
}

export function adfToText(doc: AdfNode): string {
	return renderNodes([doc], 0);
}
