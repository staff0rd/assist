import { diffHtml } from "./renderDiffBlock";
import type { MdastNode } from "./toDiffBlocks";

function isUndeclaredScreenshot(node: MdastNode, declared: Set<string>) {
	return (
		node.type === "leafDirective" &&
		node.name === "screenshot" &&
		!declared.has(node.attributes?.file ?? "")
	);
}

export function toInsertable(
	node: MdastNode,
	declared: Set<string>,
): MdastNode {
	if (isUndeclaredScreenshot(node, declared))
		return diffHtml(
			`<p>Screenshot <code>${node.attributes?.file ?? ""}</code></p>`,
		);
	const { position: _, ...rest } = node;
	if (!rest.children) return rest;
	return {
		...rest,
		children: rest.children.map((child) => toInsertable(child, declared)),
	};
}
