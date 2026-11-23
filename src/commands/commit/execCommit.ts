import type { AssistConfig } from "../../shared/types";
import { warnIfUnexpectedBranch } from "../../shared/warnIfUnexpectedBranch";
import { abortOnConflicts } from "./abortOnConflicts";
import { pullKeepingIndex } from "./pullKeepingIndex";
import { pushCommit } from "./pushCommit";
import { PushFailedError } from "./PushFailedError";
import { shouldPull } from "./shouldPull";
import { refuseLockedDocs } from "./refuseLockedDocs";
import { refuseLockedSchema } from "./refuseLockedSchema";
import { commitStaged } from "./commitStaged";
import { moveOffPlaceholder } from "./moveOffPlaceholder";
import { stageFiles } from "./stageFiles";
import { tryGit } from "../../shared/tryGit";
import { recordCommitActivity } from "./recordCommitActivity";

export async function execCommit(
	files: string[],
	message: string | null,
	config: AssistConfig,
	{ merging = false }: { merging?: boolean } = {},
): Promise<void> {
	try {
		if (!merging && message !== null) await moveOffPlaceholder(message, config);
		warnIfUnexpectedBranch(config);
		const pulled = !merging && shouldPull(config);
		if (pulled) {
			pullKeepingIndex();
		}
		abortOnConflicts(files, pulled, merging);
		if (files.length > 0) stageFiles(files);
		await refuseLockedDocs();
		await refuseLockedSchema();
		const sha = commitStaged(message);
		console.log(`Committed: ${sha}`);
		await recordCommitActivity(
			message ?? tryGit("log", "-1", "--format=%B") ?? "",
		);
		if (config.commit?.push) {
			pushCommit(config.worktree?.trunk === true);
			console.log("Pushed to remote");
		}
		process.exit(0);
	} catch (error) {
		if (error instanceof PushFailedError) reportUnpushed(error.message);
		process.exit(1);
	}
}

function reportUnpushed(reason: string): void {
	const sha = tryGit("rev-parse", "--short", "HEAD") ?? "HEAD";
	console.error(`Committed ${sha} locally but NOT pushed: ${reason}`);
}
