import { execSync } from "node:child_process";
import chalk from "chalk";
import { loadConfig } from "./loadConfig";

export function pullIfConfigured(): void {
	const config = loadConfig();
	if (!config.commit?.pull) return;
	if (hasLocalChanges()) {
		console.warn(
			chalk.yellow(
				"git pull skipped: working copy has local changes. Continuing.",
			),
		);
		return;
	}
	try {
		execSync("git pull --ff-only", { stdio: "inherit" });
	} catch {
		console.error(chalk.red("git pull --ff-only failed; aborting."));
		process.exit(1);
	}
}

function hasLocalChanges(): boolean {
	try {
		const status = execSync("git status --porcelain", {
			encoding: "utf8",
		});
		return status.trim().length > 0;
	} catch {
		return false;
	}
}
