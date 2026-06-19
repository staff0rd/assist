import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import chalk from "chalk";
import { emitActivity } from "../shared/emitActivity";
import { spawnClaude } from "../shared/spawnClaude";

export async function reviewComments(number?: string): Promise<void> {
	if (number) {
		try {
			execFileSync("gh", ["pr", "checkout", number], { stdio: "inherit" });
		} catch {
			console.error(chalk.red(`gh pr checkout ${number} failed; aborting.`));
			process.exit(1);
		}
	}
	/* why: assign the conversation id up front and report it via activity so the
	 * daemon binds the card to this transcript rather than guessing via the cwd
	 * poller, which races concurrent sessions in the same repo (#413). */
	const claudeSessionId = randomUUID();
	emitActivity({ kind: "command", name: "review-comments", claudeSessionId });
	const { done } = spawnClaude("/review-comments", {
		permissionMode: "acceptEdits",
		sessionId: claudeSessionId,
	});
	await done;
}
