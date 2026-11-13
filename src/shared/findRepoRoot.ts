import { existsSync } from "node:fs";
import path from "node:path";

export function findRepoRoot(dir: string): string | null {
	if (existsSync(path.join(dir, ".git"))) return dir;
	const parent = path.dirname(dir);
	return parent === dir ? null : findRepoRoot(parent);
}
