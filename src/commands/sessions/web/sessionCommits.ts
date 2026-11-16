import type { CommitRef } from "../../../shared/db/listCommitRefs";
import type { ConversationTarget } from "../shared/sessionConversationTarget";
import { itemCommitSources } from "./itemCommitSources";
import { transcriptCommits } from "./transcriptCommits";

export async function sessionCommits(
	cwd: string,
	session: ConversationTarget,
): Promise<CommitRef[]> {
	const sources = await itemCommitSources(session.conversationId);
	const conversationIds = new Set([
		...sources.conversationIds,
		session.conversationId,
	]);
	const commits = [...sources.commits];
	const seen = new Set(commits.map((commit) => commit.sha));
	for (const conversationId of conversationIds) {
		const target = { ...session, conversationId };
		for (const commit of await transcriptCommits(cwd, target)) {
			if (seen.has(commit.sha)) continue;
			seen.add(commit.sha);
			commits.push(commit);
		}
	}
	return commits;
}
