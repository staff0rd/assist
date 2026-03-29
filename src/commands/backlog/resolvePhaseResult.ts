import { spawnSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import chalk from "chalk";
import enquirer from "enquirer";
import { handleIncompletePhase } from "./handleIncompletePhase";
import { getPhaseStatusPath } from "./phaseDone";
import { spawnClaude } from "./spawnClaude";

function cleanupMarker(): void {
	const statusPath = getPhaseStatusPath();
	if (existsSync(statusPath)) {
		unlinkSync(statusPath);
	}
}

function runVerify(): boolean {
	const result = spawnSync("assist", ["verify"], {
		stdio: "inherit",
		shell: true,
	});
	return result.status === 0;
}

async function handleCompletedPhase(phaseIndex: number): Promise<boolean> {
	cleanupMarker();
	console.log(
		chalk.green(`\nPhase ${phaseIndex + 1} completed. Running verify...`),
	);

	if (runVerify()) {
		console.log(chalk.green("Verification passed."));
		return true;
	}

	while (true) {
		const { action } = await enquirer.prompt<{ action: string }>({
			type: "select",
			name: "action",
			message: "Verification failed. What would you like to do?",
			choices: ["Fix", "Continue to next phase", "Abort"],
		});

		if (action === "Fix") {
			const { done } = spawnClaude(
				"Run /verify and fix all failures. Do not move on until every check passes.",
			);
			await done;
			if (runVerify()) {
				console.log(chalk.green("Verification passed."));
				return true;
			}
			continue;
		}

		return action === "Continue to next phase";
	}
}

/** Returns step delta: 1 = advance, 0 = retry, -1 = abort */
export async function resolvePhaseResult(
	phaseIndex: number,
	options?: { skipVerify?: boolean },
): Promise<number> {
	if (!existsSync(getPhaseStatusPath())) {
		const action = await handleIncompletePhase();
		if (action === "abort") return -1;
		return action === "skip" ? 1 : 0;
	}

	if (options?.skipVerify) {
		cleanupMarker();
		return 1;
	}

	const shouldContinue = await handleCompletedPhase(phaseIndex);
	return shouldContinue ? 1 : -1;
}
