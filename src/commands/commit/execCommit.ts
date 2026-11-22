import { formatItemId } from "../backlog/formatItemId";
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
import { refuseLockedSchema } from "./refuseLockedSchema";
import { commitStaged } from "./commitStaged";
import { moveOffPlaceholder } from "./moveOffPlaceholder";
import { stageFiles } from "./stageFiles";
import { tryGit } from "../../shared/tryGit";

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
	} catch {
		process.exit(1);
	}
}

async function recordCommitActivity(message: string): Promise<void> {
	if (resolveSessionItemId() === null) return;
	const result = await recordSessionRefs(collectCommitRefs(message));
	if (result.status !== "failed") return;
	const reason =
		result.error instanceof Error ? result.error.message : String(result.error);
	console.error(
		`Warning: the commit was not recorded on item ${formatItemId(result.itemId)}: ${reason}`,
	);
}
