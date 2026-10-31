import type { MdastNode } from "./toDiffBlocks";

export function normalizeLines(text: string): string {
	return text
		.split("\n")
		.map((line) => line.trimEnd())
		.join("\n");
}

export function sourceOf(node: MdastNode, source: string): string {
	const start = node.position?.start.offset;
	const end = node.position?.end.offset;
	return normalizeLines(
		start === undefined || end === undefined
			? JSON.stringify(node, (key, value) =>
					key === "position" ? undefined : value,
				)
			: source.slice(start, end),
	);
}
