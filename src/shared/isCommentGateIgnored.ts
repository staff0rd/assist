import path from "node:path";
import { minimatch } from "minimatch";
import { findRepoRoot } from "./findRepoRoot";

function toRepoRelative(file: string): string {
	const absolute = path.resolve(file);
	const root = findRepoRoot(path.dirname(absolute));
	const relative = root ? path.relative(root, absolute) : file;
	return relative.split(path.sep).join("/");
}

export function isCommentGateIgnored(
	file: string,
	ignoreGlobs: string[],
): boolean {
	if (ignoreGlobs.length === 0) return false;
	const relative = toRepoRelative(file);
	return ignoreGlobs.some((glob) => minimatch(relative, glob));
}
