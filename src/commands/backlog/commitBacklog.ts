import { execSync } from "node:child_process";
import chalk from "chalk";
import { shellQuote } from "../../shared/shellQuote";
import { getBacklogPath } from "./shared";

export function commitBacklog(id: number, name: string): void {
	try {
		const backlogPath = getBacklogPath();
		const message = `chore: add backlog item #${id} — ${name}`;
		execSync(`git add ${shellQuote(backlogPath)}`, { stdio: "ignore" });
		execSync(`git commit -m ${shellQuote(message)}`, { stdio: "ignore" });
	} catch {
		console.log(chalk.yellow("Warning: could not auto-commit backlog file."));
	}
}
