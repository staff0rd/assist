import { execGit } from "./execGit";
import type { ChangeGroup } from "./itemChangeSet";
import { parseDiffNameStatus } from "./parseDiffNameStatus";
import type { GitStatusCounts } from "./parseGitStatus";

async function untrackedPaths(cwd: string): Promise<string[]> {
	const list = await execGit(cwd, [
		"ls-files",
		"--others",
		"--exclude-standard",
	]);
	return list.split("\n").filter(Boolean);
}

export async function groupedCounts(
	cwd: string,
	groups: ChangeGroup[],
): Promise<GitStatusCounts> {
	const outputs: string[] = [];
	for (const group of groups) {
		outputs.push(
			await execGit(cwd, [
				"diff",
				"--name-status",
				group.base,
				"--",
				...group.paths,
			]),
		);
	}
	const counts = parseDiffNameStatus(outputs.join(""));
	counts.new.push(...(await untrackedPaths(cwd)));
	return counts;
}
