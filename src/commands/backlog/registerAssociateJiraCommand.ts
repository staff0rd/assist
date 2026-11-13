import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";

export function registerAssociateJiraCommand(cmd: Command): void {
	cmd
		.command("associate-jira <id> [key]")
		.description("Associate a Jira ticket with a backlog item")
		.option("--clear", "Remove the Jira association from the item")
		.action(lazyAction(() => import("./associateJira"), "associateJira"));
}
