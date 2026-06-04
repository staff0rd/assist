import { execSync } from "node:child_process";
import chalk from "chalk";
import { loadConfig } from "./loadConfig";

export function pullIfConfigured(): void {
	const config = loadConfig();
	if (!config.commit?.pull) return;
	try {
		execSync("git pull --ff-only", { stdio: "inherit" });
	} catch {
		console.error(chalk.red("git pull --ff-only failed; aborting."));
		process.exit(1);
	}
}
