import { buildHighLevelStructure } from "./buildHighLevelStructure";
import { pathOfHunkRef } from "./pathOfHunkRef";
import { type HunkSlices, scopeFileToSlice } from "./scopeFileToSlice";
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

function hunkSlicesOf(slices: HighLevelSlice[]): HunkSlices {
	const map: HunkSlices = new Map();
	slices.forEach((slice, index) => {
		for (const ref of slice.hunks)
			map.set(ref, [...(map.get(ref) ?? []), index + 1]);
	});
	return map;
}

export function sliceHighLevelStructures(
	structure: HighLevelStructure,
	slices: HighLevelSlice[],
	hiddenPaths: ReadonlySet<string> = new Set(),
): HighLevelStructure[] {
	const files = filesOf(structure.tree).filter(
		(file) => !hiddenPaths.has(file.path),
	);
	const hunkSlices = hunkSlicesOf(slices);
	return slices.map((slice, index) => {
		const paths = new Set(slice.hunks.map(pathOfHunkRef));
		return buildHighLevelStructure(
			files
				.filter((file) => paths.has(file.path))
				.map((file) => scopeFileToSlice(file, index + 1, hunkSlices)),
		);
	});
}
