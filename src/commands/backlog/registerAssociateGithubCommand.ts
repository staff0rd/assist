import type { Command } from "commander";
import { associateGithub } from "./associate-github";

export function registerAssociateGithubCommand(cmd: Command): void {
	cmd
		.command("associate-github <id> [issue]")
		.description("Associate a GitHub issue with a backlog item")
		.option("--clear", "Remove the GitHub association from the item")
		.action(associateGithub);
}
