import type { DiffBlock } from "./diffBlocks";

type Point = { offset?: number };

export type MdastNode = {
	type: string;
	name?: string;
	ordered?: boolean | null;
	attributes?: Record<string, string | null | undefined> | null;
	data?: Record<string, unknown>;
	position?: { start: Point; end: Point };
	children?: MdastNode[];
};

const IGNORED = new Set(["yaml", "toml", "definition"]);
const LIST_MARKER = /^\s*(?:[-*+]|\d+[.)])\s+/;

function sourceOf(node: MdastNode, source: string): string {
	const start = node.position?.start.offset;
	const end = node.position?.end.offset;
	const text =
		start === undefined || end === undefined
			? JSON.stringify(node, (key, value) =>
					key === "position" ? undefined : value,
				)
			: source.slice(start, end);
	return text
		.split("\n")
		.map((line) => line.trimEnd())
		.join("\n");
}

function containerOf(node: MdastNode): string | undefined {
	if (node.type === "list") return `list:${node.ordered === true}`;
	if (node.type === "table") return "table";
	return undefined;
}

function toBlock(node: MdastNode, source: string): DiffBlock<MdastNode> {
	const key = sourceOf(node, source);
	const container = containerOf(node);
	if (!container) return { key, node };
	return {
		key,
		node,
		container,
		children: (node.children ?? []).map((child) => ({
			key: sourceOf(child, source).replace(LIST_MARKER, ""),
			node: child,
		})),
	};
}

export function toDiffBlocks(
	root: MdastNode,
	source: string,
): DiffBlock<MdastNode>[] {
	return (root.children ?? [])
		.filter((node) => !IGNORED.has(node.type))
		.map((node) => toBlock(node, source));
}
