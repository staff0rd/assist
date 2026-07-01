import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";

export function findSynthesisForBranch(
	repoReviewsDir: string,
	branch: string,
): string | null {
	const branchKeyPath = join(repoReviewsDir, `${branch}-`);
	const parent = dirname(branchKeyPath);
	const branchPrefix = basename(branchKeyPath);
	if (!existsSync(parent)) return null;
	const synthesisFiles = readdirSync(parent)
		.filter((name) => name.startsWith(branchPrefix))
		.map((name) => join(parent, name, "synthesis.md"))
		.filter((path) => existsSync(path))
		.map((path) => ({ path, mtime: statSync(path).mtimeMs }))
		.sort((a, b) => b.mtime - a.mtime);
	return synthesisFiles[0]?.path ?? null;
}
