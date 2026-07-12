import { execSync } from "node:child_process";
import { recordSessionRefs } from "../shared/db/recordSessionRefs";
import { loadConfig } from "../shared/loadConfig";
import { resolveSessionItemId } from "../shared/resolveSessionItemId";
import type { AssistConfig } from "../shared/types";
import { warnIfUnexpectedBranch } from "../shared/warnIfUnexpectedBranch";
import { abortOnConflicts } from "./commit/abortOnConflicts";
import { collectCommitRefs } from "./commit/collectCommitRefs";
import { commitStaged, stageAndCommit } from "./commit/stageAndCommit";
import { validateMessage } from "./commit/validateMessage";

async function execCommit(
	files: string[],
	message: string,
	config: AssistConfig,
): Promise<void> {
	try {
		warnIfUnexpectedBranch(config);
		const pulled = Boolean(config.commit?.pull);
		if (pulled) {
			execSync("git pull --autostash", { stdio: "inherit" });
		}
		abortOnConflicts(files, pulled);
		const sha =
			files.length > 0 ? stageAndCommit(files, message) : commitStaged(message);
		console.log(`Committed: ${sha}`);
		if (config.commit?.push) {
			execSync("git push", { stdio: "inherit" });
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

export async function commit(args: string[]): Promise<void> {
	if (args[0] === "status") {
		execSync("git status && echo '---DIFF---' && git diff", {
			stdio: "inherit",
		});
		return;
	}

	if (args.length < 1) {
		console.error("Usage: assist commit <message> [files...]");
		process.exit(1);
	}

	const message = args[0];
	const files = args.slice(1);
	const config = loadConfig();

	validateMessage(message, config);
	await execCommit(files, message, config);
}
