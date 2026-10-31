import type { MdastNode } from "./toDiffBlocks";

export const docsDiffClasses = {
	added: "assist-diff-added",
	removed: "assist-diff-removed",
	newPage: "assist-diff-new-page",
};

const CLASSABLE = new Set([
	"paragraph",
	"heading",
	"blockquote",
	"list",
	"listItem",
	"table",
	"tableRow",
	"thematicBreak",
]);

export function isClassable(node: MdastNode): boolean {
	return CLASSABLE.has(node.type);
}

export function withClass(data: MdastNode["data"], className: string) {
	const hProperties = (data?.hProperties ?? {}) as Record<string, unknown>;
	const existing = hProperties.className;
	const classes = Array.isArray(existing)
		? existing
		: existing
			? [existing]
			: [];
	return {
		...data,
		hProperties: { ...hProperties, className: [...classes, className] },
	};
}

export function diffHtml(value: string): MdastNode & { value: string } {
	return { type: "html", value };
}

export function renderDiffBlock(
	node: MdastNode,
	className: string,
): MdastNode[] {
	if (isClassable(node))
		return [{ ...node, data: withClass(node.data, className) }];
	return [diffHtml(`<div class="${className}">`), node, diffHtml("</div>")];
}
