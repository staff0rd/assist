import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export function findRepoRoot(dir: string): string | undefined {
	let current = resolve(dir);
	for (;;) {
		if (existsSync(join(current, ".git"))) return current;
		const parent = dirname(current);
		if (parent === current) return undefined;
		current = parent;
	}
}
