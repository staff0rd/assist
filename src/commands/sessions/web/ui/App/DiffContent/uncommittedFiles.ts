import type { ItemStatusCounts } from "../../../gitStatus";

export type UncommittedFiles = {
	paths: ReadonlySet<string>;
	newPaths: ReadonlySet<string>;
};

export function uncommittedFiles(
	status: ItemStatusCounts | null,
): UncommittedFiles {
	const tree = status?.uncommitted ?? status;
	const newPaths = tree?.new ?? [];
	return {
		paths: new Set([
			...newPaths,
			...(tree?.modified ?? []),
			...(tree?.deleted ?? []),
		]),
		newPaths: new Set(newPaths),
	};
}
