import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import type { AssistConfig } from "../../shared/types";
import { warnIfUnexpectedBranch } from "../../shared/warnIfUnexpectedBranch";
import { abortOnConflicts } from "./abortOnConflicts";
import { collectCommitRefs } from "./collectCommitRefs";
import { pullKeepingIndex } from "./pullKeepingIndex";
import { pushCommit } from "./pushCommit";
import { shouldPull } from "./shouldPull";
import { refuseLockedDocs } from "./refuseLockedDocs";
import { commitStaged } from "./commitStaged";
import { stageFiles } from "./stageFiles";

export async function execCommit(
	files: string[],
	message: string,
	config: AssistConfig,
): Promise<void> {
	try {
		warnIfUnexpectedBranch(config);
		const pulled = shouldPull(config);
		if (pulled) {
			pullKeepingIndex();
		}
		abortOnConflicts(files, pulled);
		if (files.length > 0) stageFiles(files);
		await refuseLockedDocs();
		const sha = commitStaged(message);
		console.log(`Committed: ${sha}`);
		if (config.commit?.push) {
			pushCommit(config.worktree?.trunk === true);
			console.log("Pushed to remote");
		}
		await recordCommitActivity(message);
		process.exit(0);
	} catch {
		process.exit(1);
	}
}

async function recordCommitActivity(message: string): Promise<void> {
	if (resolveSessionItemId() === null) return;
	await recordSessionRefs(collectCommitRefs(message));
}
