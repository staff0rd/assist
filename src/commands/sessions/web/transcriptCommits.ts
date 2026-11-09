import type { CommitRef } from "../../../shared/db/listCommitRefs";
import type { ConversationTarget } from "../shared/sessionConversationTarget";
import { targetConversationEvents } from "../shared/targetConversationEvents";
import { execGit } from "./execGit";
import { parseTranscriptCommitShas } from "./parseTranscriptCommitShas";

async function headCommit(
	cwd: string,
	sha: string,
): Promise<string | undefined> {
	try {
		const full = (
			await execGit(cwd, [
				"rev-parse",
				"--verify",
				"--quiet",
				`${sha}^{commit}`,
			])
		).trim();
		await execGit(cwd, ["merge-base", "--is-ancestor", full, "HEAD"]);
		return full;
	} catch {
		return undefined;
	}
}

export async function transcriptCommits(
	cwd: string,
	session: ConversationTarget,
): Promise<CommitRef[]> {
	const events = await targetConversationEvents(cwd, session);
	const shas: string[] = [];
	for (const sha of parseTranscriptCommitShas(events)) {
		const full = await headCommit(cwd, sha);
		if (full && !shas.includes(full)) shas.push(full);
	}
	return shas.map((sha) => ({ sha }));
}
