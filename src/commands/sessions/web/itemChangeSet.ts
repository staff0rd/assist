import type { CommitRef } from "../../../shared/db/listCommitRefs";
import type { ConversationTarget } from "../shared/sessionConversationTarget";
import { execGit } from "./execGit";
import { committedPaths } from "./committedPaths";
import { includesCommittedChanges } from "./includesCommittedChanges";

export type ChangeGroup = { base: string; paths: string[] };

type ItemChangeSet = { commits: CommitRef[]; groups: ChangeGroup[] };

export async function itemChangeSet(
	cwd: string,
	session?: ConversationTarget,
): Promise<ItemChangeSet | undefined> {
	if (!session || !includesCommittedChanges(cwd)) return undefined;
	const { commits, bases } = await committedPaths(cwd, session);
	if (bases.size === 0) return undefined;

	const groups = groupByBase(bases);
	const dirty = await dirtyPaths(cwd, bases);
	if (dirty.length > 0) groups.push({ base: "HEAD", paths: dirty });
	return { commits, groups };
}

function groupByBase(bases: Map<string, string>): ChangeGroup[] {
	const groups = new Map<string, string[]>();
	for (const [path, base] of bases) {
		const paths = groups.get(base);
		if (paths) paths.push(path);
		else groups.set(base, [path]);
	}
	return [...groups].map(([base, paths]) => ({ base, paths: paths.sort() }));
}

async function dirtyPaths(
	cwd: string,
	bases: Map<string, string>,
): Promise<string[]> {
	const output = await execGit(cwd, ["diff", "--name-only", "HEAD"]);
	return output
		.split("\n")
		.filter((path) => path && !bases.has(path))
		.sort();
}
