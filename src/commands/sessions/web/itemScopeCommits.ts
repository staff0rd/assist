import type { CommitRef } from "../../../shared/db/listCommitRefs";
import type { ConversationTarget } from "../shared/sessionConversationTarget";
import { committedPaths } from "./committedPaths";
import { includesCommittedChanges } from "./includesCommittedChanges";

export async function itemScopeCommits(
	cwd: string,
	session?: ConversationTarget,
): Promise<CommitRef[]> {
	if (!session || !includesCommittedChanges(cwd)) return [];
	return (await committedPaths(cwd, session)).commits;
}
