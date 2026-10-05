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
	if (!hasUpstream()) {
		console.warn(
			chalk.yellow(
				"git pull skipped: the current branch has no upstream. Continuing.",
			),
		);
		return;
	}
	try {
		execSync("git fetch", { stdio: "inherit" });
		execSync("git merge --ff-only @{u}", { stdio: "inherit" });
	} catch {
		console.error(chalk.red("git fast-forward to upstream failed; aborting."));
		process.exit(1);
	}
}

function hasUpstream(): boolean {
	try {
		execSync("git rev-parse --abbrev-ref --symbolic-full-name @{upstream}", {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
		return true;
	} catch {
		return false;
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
