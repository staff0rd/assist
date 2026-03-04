import { existsSync } from "node:fs";
import path from "node:path";

export function findRepoRoot(dir: string): string | null {
	let current = dir;
	while (current !== path.dirname(current)) {
		if (existsSync(path.join(current, ".git"))) {
			return current;
		}
		current = path.dirname(current);
	}
	return null;
}
