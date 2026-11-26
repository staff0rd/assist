import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function instanceReportDir(
	project: string,
	root: string = join(homedir(), ".assist", "review-reports"),
): string {
	const dir = join(root, project);
	mkdirSync(dir, { recursive: true });
	return dir;
}
