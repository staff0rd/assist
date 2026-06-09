import type { Node } from "ts-morph";

export function collectComments(
	sourceFile: Node,
): { pos: number; text: string }[] {
	const seen = new Set<number>();
	const comments: { pos: number; text: string }[] = [];

	const collect = (node: Node): void => {
		for (const range of [
			...node.getLeadingCommentRanges(),
			...node.getTrailingCommentRanges(),
		]) {
			const pos = range.getPos();
			if (seen.has(pos)) continue;
			seen.add(pos);
			comments.push({ pos, text: range.getText() });
		}
	};

	collect(sourceFile);
	sourceFile.forEachDescendant(collect);
	return comments;
}
