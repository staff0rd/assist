import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { acceptanceCriteria } from "./jira/acceptanceCriteria";
import { jiraAuth } from "./jira/jiraAuth";
import { viewIssue } from "./jira/viewIssue";

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

	jiraCommand
		.command("view <issue-key>")
		.description("Print the title and description of a Jira issue")
		.action((issueKey: string) => viewIssue(issueKey));

	configHelp(jiraCommand, [
		{
			key: "jira.acField",
			setter: "assist config set jira.acField customfield_11937",
			note: "custom field holding acceptance criteria (default: customfield_11937)",
		},
	]);
}
