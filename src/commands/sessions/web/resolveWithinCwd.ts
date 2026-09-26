import { isAbsolute, relative, resolve } from "node:path";

export function repoRoot(cwd: string): string {
	return resolve(cwd);
}

export function resolveWithinCwd(cwd: string, path: string): string | null {
	const root = repoRoot(cwd);
	const target = resolve(root, path);
	const rel = relative(root, target);
	if (rel === "" || rel.startsWith("..") || isAbsolute(rel)) return null;
	return target;
}
