import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { jiraConfigHelp } from "./jira/jiraConfigHelp";
import { lazyAction } from "../shared/lazyAction";

export function registerJira(program: Command): void {
	const jiraCommand = program.command("jira").description("Jira utilities");

	jiraCommand
		.command("auth")
		.description("Authenticate with Jira via API token")
		.action(lazyAction(() => import("./jira/jiraAuth"), "jiraAuth"));

	jiraCommand
		.command("ac <issue-key>")
		.description("Print acceptance criteria for a Jira issue")
		.action(async (issueKey: string) =>
			(await import("./jira/acceptanceCriteria")).acceptanceCriteria(issueKey),
		);

	jiraCommand
		.command("view <issue-key>")
		.description("Print the title and description of a Jira issue")
		.action(async (issueKey: string) =>
			(await import("./jira/viewIssue")).viewIssue(issueKey),
		);

	configHelp(jiraCommand, jiraConfigHelp);
}
