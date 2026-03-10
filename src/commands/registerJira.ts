import type { Command } from "commander";
import { acceptanceCriteria } from "./jira/acceptanceCriteria";
import { jiraAuth } from "./jira/jiraAuth";

export function registerJira(program: Command): void {
	const jiraCommand = program.command("jira").description("Jira utilities");

	jiraCommand
		.command("auth")
		.description("Authenticate with Jira via API token")
		.action(() => jiraAuth());

	jiraCommand
		.command("ac <issue-key>")
		.description("Print acceptance criteria for a Jira issue")
		.action((issueKey: string) => acceptanceCriteria(issueKey));
}
