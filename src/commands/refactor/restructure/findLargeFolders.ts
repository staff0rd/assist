import path from "node:path";

export type LargeFolder = { folder: string; files: number };

export function findLargeFolders(
	targets: string[],
	scopeRoot: string,
	limit: number,
): LargeFolder[] {
	const counts = new Map<string, number>();
	for (const target of targets) {
		const folder = path.relative(scopeRoot, path.dirname(target));
		if (folder !== "") counts.set(folder, (counts.get(folder) ?? 0) + 1);
	}
	return [...counts]
		.filter(([, files]) => files > limit)
		.sort(([a, fa], [b, fb]) => fb - fa || a.localeCompare(b))
		.map(([folder, files]) => ({
			folder: folder.split(path.sep).join("/"),
			files,
		}));
}
