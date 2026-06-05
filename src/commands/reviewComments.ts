import { execFileSync } from "node:child_process";
import chalk from "chalk";
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
	const { done } = spawnClaude("/review-comments", { allowEdits: true });
	await done;
}
