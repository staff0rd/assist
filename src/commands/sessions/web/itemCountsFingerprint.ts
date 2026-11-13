import { execGit } from "./execGit";
import type { ChangeGroup } from "./itemChangeSet";
import type { GitStatusCounts } from "./parseGitStatus";

async function headCommit(cwd: string): Promise<string> {
	try {
		return (await execGit(cwd, ["rev-parse", "HEAD"])).trim();
	} catch {
		return "";
	}
}

async function dirtyItemContents(
	cwd: string,
	groups: ChangeGroup[],
	uncommitted: GitStatusCounts,
): Promise<string> {
	const dirty = new Set([...uncommitted.modified, ...uncommitted.new]);
	const paths = groups
		.flatMap((group) => group.paths)
		.filter((path) => dirty.has(path));
	if (paths.length === 0) return "";
	try {
		return await execGit(cwd, ["hash-object", "--", ...paths]);
	} catch {
		return `unhashed ${Date.now()} ${Math.random()}`;
	}
}

export async function itemCountsFingerprint(
	cwd: string,
	groups: ChangeGroup[],
	uncommitted: GitStatusCounts,
): Promise<string> {
	const [head, contents] = await Promise.all([
		headCommit(cwd),
		dirtyItemContents(cwd, groups, uncommitted),
	]);
	return JSON.stringify([head, groups, uncommitted, contents]);
}
