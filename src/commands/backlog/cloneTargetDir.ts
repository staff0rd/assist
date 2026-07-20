import { join, resolve } from "node:path";

export function cloneTargetDir(origin: string, baseDir: string): string | null {
	if (origin.startsWith("local:")) return null;
	const repoName = origin.split("/").filter(Boolean).pop();
	if (!repoName) return null;
	return resolve(join(baseDir, repoName));
}
