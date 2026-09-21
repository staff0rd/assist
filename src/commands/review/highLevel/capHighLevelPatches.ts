import { minimatch } from "minimatch";
import { capPatchToBudget } from "./capPatchToBudget";
import type { HighLevelFile } from "./types";

const MAX_FILE_PATCH_LINES = 1500;
const MAX_TOTAL_PATCH_LINES = 20000;

function criticalFirst(
	files: HighLevelFile[],
	criticalPaths: string[],
): HighLevelFile[] {
	const isCritical = (file: HighLevelFile) =>
		criticalPaths.some((glob) => minimatch(file.path, glob));
	return [...files].sort(
		(a, b) => Number(isCritical(b)) - Number(isCritical(a)),
	);
}

function capped(file: HighLevelFile, budget: number): HighLevelFile {
	if (file.patch === undefined) return file;
	const { patch, truncated } = capPatchToBudget(file.patch, budget);
	const { patch: _dropped, ...rest } = file;
	return {
		...rest,
		...(patch === undefined ? {} : { patch }),
		...(truncated ? { truncated: true } : {}),
	};
}

export function capHighLevelPatches(
	files: HighLevelFile[],
	criticalPaths: string[],
): HighLevelFile[] {
	let remaining = MAX_TOTAL_PATCH_LINES;
	const byPath = new Map<string, HighLevelFile>();
	for (const file of criticalFirst(files, criticalPaths)) {
		const result = capped(file, Math.min(MAX_FILE_PATCH_LINES, remaining));
		remaining -= result.patch?.split("\n").length ?? 0;
		byPath.set(file.path, result);
	}
	return files.map((file) => byPath.get(file.path) ?? file);
}
