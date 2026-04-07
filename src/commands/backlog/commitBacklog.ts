import { execSync } from "node:child_process";
import { join } from "node:path";
import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { shellQuote } from "../../shared/shellQuote";
import { getBacklogDir } from "./shared";

export function commitBacklog(id: number, name: string): void {
	const config = loadConfig();
	if (!config.backlog.autoCommit) {
		console.log(
			chalk.yellow(
				"Warning: auto-commit is disabled. Stage and commit the backlog file manually.",
			),
		);
		return;
	}

	try {
		const jsonlPath = join(getBacklogDir(), ".assist", "backlog.jsonl");
		const message = `chore: add backlog item #${id} — ${name}`;
		execSync(`git add ${shellQuote(jsonlPath)}`, { stdio: "ignore" });
		execSync(`git commit -m ${shellQuote(message)}`, { stdio: "ignore" });
	} catch {
		console.log(chalk.yellow("Warning: could not auto-commit backlog file."));
	}
}
