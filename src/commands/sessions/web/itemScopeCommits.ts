import type { CommitRef } from "../../../shared/db/listCommitRefs";
import { committedPaths } from "./committedPaths";
import { includesCommittedChanges } from "./includesCommittedChanges";

export async function itemScopeCommits(
	cwd: string,
	sessionId?: string,
): Promise<CommitRef[]> {
	if (!sessionId || !includesCommittedChanges(cwd)) return [];
	return (await committedPaths(cwd, sessionId)).commits;
}
