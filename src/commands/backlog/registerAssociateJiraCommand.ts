import type { Command } from "commander";
import { associateJira } from "./associate-jira";

export function registerAssociateJiraCommand(cmd: Command): void {
	cmd
		.command("associate-jira <id> [key]")
		.description("Associate a Jira ticket with a backlog item")
		.option("--clear", "Remove the Jira association from the item")
		.action(associateJira);
}
