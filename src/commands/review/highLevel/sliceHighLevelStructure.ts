import { buildHighLevelStructure } from "./buildHighLevelStructure";
import type {
	HighLevelFile,
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTreeNode,
} from "./types";

function filesOf(nodes: HighLevelTreeNode[]): HighLevelFile[] {
	return nodes.flatMap((node) => {
		if (node.kind === "dir") return filesOf(node.children);
		const { kind: _kind, name: _name, ...file } = node;
		return [file];
	});
}

function pathOfRef(ref: string): string {
	return ref.slice(0, ref.lastIndexOf("#"));
}

export function sliceHighLevelStructure(
	structure: HighLevelStructure,
	slice: HighLevelSlice,
): HighLevelStructure {
	const paths = new Set(slice.hunks.map(pathOfRef));
	return buildHighLevelStructure(
		filesOf(structure.tree).filter((file) => paths.has(file.path)),
	);
}
