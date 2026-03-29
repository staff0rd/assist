import { spawnSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import chalk from "chalk";
import enquirer from "enquirer";
import { getPhaseStatusPath } from "./phaseDone";

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

	const { action } = await enquirer.prompt<{ action: string }>({
		type: "select",
		name: "action",
		message: "Verification failed. What would you like to do?",
		choices: ["Continue to next phase", "Abort"],
	});
	return action === "Continue to next phase";
}

async function handleIncompletePhase(): Promise<"retry" | "skip" | "abort"> {
	const { action } = await enquirer.prompt<{ action: string }>({
		type: "select",
		name: "action",
		message: "Phase was not marked complete. What would you like to do?",
		choices: ["Retry this phase", "Skip to next phase", "Abort"],
	});
	if (action === "Retry this phase") return "retry";
	if (action === "Skip to next phase") return "skip";
	return "abort";
}

/** Returns step delta: 1 = advance, 0 = retry, -1 = abort */
export async function resolvePhaseResult(phaseIndex: number): Promise<number> {
	if (existsSync(getPhaseStatusPath())) {
		const shouldContinue = await handleCompletedPhase(phaseIndex);
		return shouldContinue ? 1 : -1;
	}

	const action = await handleIncompletePhase();
	if (action === "abort") return -1;
	return action === "skip" ? 1 : 0;
}
