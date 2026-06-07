import * as path from "node:path";

export function repoPrefix(cwd?: string): string {
	if (!cwd) return "";
	return `${path.basename(cwd)}/`;
}
