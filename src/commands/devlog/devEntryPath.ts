import { join } from "node:path";

export function devEntryPath(
	repoName: string,
	week: string,
	devDir: string,
): string {
	return join(devDir, repoName, `${week.toLowerCase()}.md`);
}
