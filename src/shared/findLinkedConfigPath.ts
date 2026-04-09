import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

export function findLinkedConfigPath(
	linkPath: string,
	fromDir: string,
): string {
	const resolved = resolve(fromDir, linkPath);
	const claudePath = join(resolved, ".claude", "assist.yml");
	if (existsSync(claudePath)) return claudePath;
	const rootPath = join(resolved, "assist.yml");
	if (existsSync(rootPath)) return rootPath;
	throw new Error(`No assist.yml found in linked project: ${resolved}`);
}
