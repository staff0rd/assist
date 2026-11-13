import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { editHelpText } from "./prs/editHelpText";
import { lazyAction } from "../shared/lazyAction";

function collect(value: string, previous: string[]): string[] {
	return previous.concat([value]);
}

export function registerPrsEdit(prsCommand: Command): void {
	const editCommand = prsCommand
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
		.option(
			"--screenshot <spec>",
			"Attach a screenshot as '[Group/]Caption=path', replacing the ## Screenshots section (repeatable)",
			collect,
			[],
		)
		.addHelpText("after", () => editHelpText())
		.action(lazyAction(() => import("./prs/edit"), "edit"));
	internalCommand(editCommand, "agents revising their pull request");
}
