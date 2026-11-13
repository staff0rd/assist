import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";

export function registerAssociateGithubCommand(cmd: Command): void {
	cmd
		.command("associate-github <id> [issue]")
		.description("Associate a GitHub issue with a backlog item")
		.option("--clear", "Remove the GitHub association from the item")
		.action(lazyAction(() => import("./associateGithub"), "associateGithub"));
}
