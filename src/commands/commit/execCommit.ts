import { execSync } from "node:child_process";
import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import type { AssistConfig } from "../../shared/types";
import { warnIfUnexpectedBranch } from "../../shared/warnIfUnexpectedBranch";
import { abortOnConflicts } from "./abortOnConflicts";
import { collectCommitRefs } from "./collectCommitRefs";
import { pushCommit } from "./pushCommit";
import { shouldPull } from "./shouldPull";
import { commitStaged, stageAndCommit } from "./stageAndCommit";

export async function execCommit(
	files: string[],
	message: string,
	config: AssistConfig,
): Promise<void> {
	try {
		warnIfUnexpectedBranch(config);
		const pulled = shouldPull(config);
		if (pulled) {
			execSync("git pull --autostash", { stdio: "inherit" });
		}
		abortOnConflicts(files, pulled);
		const sha =
			files.length > 0 ? stageAndCommit(files, message) : commitStaged(message);
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
