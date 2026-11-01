import type { UncommittedFiles } from "./uncommittedFiles";

export function revertablePaths(
	paths: string[],
	uncommitted: UncommittedFiles | undefined,
): string[] {
	if (!uncommitted) return paths;
	return paths.filter((path) => uncommitted.paths.has(path));
}
