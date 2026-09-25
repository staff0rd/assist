import type { Command } from "commander";
import { edit as prsEdit } from "./prs/edit";
import { editHelpText } from "./prs/editHelpText";

function collect(value: string, previous: string[]): string[] {
	return previous.concat([value]);
}

export function registerPrsEdit(prsCommand: Command): void {
	prsCommand
		.command("edit")
		.description(
			"Update individual sections of the current branch's pull request",
		)
		.option("-t, --title <title>", "New title for the pull request")
		.option("--what <what>", "Replace the ## What section")
		.option("--why <why>", "Replace the ## Why section")
		.option("--how <how>", "Replace the ## How section")
		.option(
			"--resolves <ref>",
			"Jira issue key or GitHub issue reference resolved by this PR, appended to ## Why (repeatable)",
			collect,
			[],
		)
		.addHelpText("after", () => editHelpText())
		.action(prsEdit);
}
