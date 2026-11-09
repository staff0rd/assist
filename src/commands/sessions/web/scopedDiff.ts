import type { ConversationTarget } from "../shared/sessionConversationTarget";
import { execGit } from "./execGit";
import { type ChangeGroup, itemChangeSet } from "./itemChangeSet";
import { commitBase } from "./resolveCommit";
import type { DiffScope } from "./resolveDiffScope";

const MAX_DIFF_BYTES = 50 * 1024 * 1024;

export async function scopedDiff(
	cwd: string,
	session: ConversationTarget | undefined,
	scope: DiffScope,
): Promise<string> {
	if (scope.kind === "commit") return commitDiff(cwd, scope.sha);
	return (
		(await trackedScopeDiff(cwd, session, scope)) + (await untrackedDiff(cwd))
	);
}

async function untrackedFileDiff(cwd: string, path: string): Promise<string> {
	return execGit(cwd, ["diff", "--no-index", "--", "/dev/null", path], {
		maxBuffer: MAX_DIFF_BYTES,
		allowFailure: true,
	});
}

async function untrackedDiff(cwd: string): Promise<string> {
	const list = await execGit(cwd, [
		"ls-files",
		"--others",
		"--exclude-standard",
	]);
	const paths = list.split("\n").filter(Boolean);
	const diffs = await Promise.all(
		paths.map((path) => untrackedFileDiff(cwd, path)),
	);
	return diffs.join("");
}

async function groupedDiff(
	cwd: string,
	groups: ChangeGroup[],
): Promise<string> {
	const diffs = await Promise.all(
		groups.map((group) =>
			execGit(cwd, ["diff", group.base, "--", ...group.paths], {
				maxBuffer: MAX_DIFF_BYTES,
			}),
		),
	);
	return diffs.join("");
}

async function baseDiff(cwd: string, base: string): Promise<string> {
	return execGit(cwd, ["diff", base], { maxBuffer: MAX_DIFF_BYTES });
}

async function workingTreeDiff(cwd: string): Promise<string> {
	return baseDiff(cwd, "HEAD");
}

async function trackedScopeDiff(
	cwd: string,
	session: ConversationTarget | undefined,
	scope: Exclude<DiffScope, { kind: "commit" }>,
): Promise<string> {
	if (scope.kind === "branch") return baseDiff(cwd, scope.base);
	if (scope.kind === "uncommitted") return workingTreeDiff(cwd);
	return trackedDiff(cwd, session);
}

async function trackedDiff(
	cwd: string,
	session?: ConversationTarget,
): Promise<string> {
	const changeSet = await itemChangeSet(cwd, session);
	if (changeSet) return groupedDiff(cwd, changeSet.groups);
	return workingTreeDiff(cwd);
}

async function commitDiff(cwd: string, sha: string): Promise<string> {
	const base = await commitBase(cwd, sha);
	if (!base) return "";
	return execGit(cwd, ["diff", base, sha], { maxBuffer: MAX_DIFF_BYTES });
}
