import type { Command } from "commander";
import { raise as prsRaise } from "./prs/index";

function collect(value: string, previous: string[]): string[] {
	return previous.concat([value]);
}

export function registerPrsRaise(prsCommand: Command): void {
	prsCommand
		.command("raise")
		.description(
			"Raise a pull request, assembling the body from discrete sections",
		)
		.option("-t, --title <title>", "Title for the pull request")
		.option("--what <what>", "What the change does (## What section)")
		.option("--why <why>", "Why the change is needed (## Why section)")
		.option("--how <how>", "How the change works (optional ## How section)")
		.option(
			"--resolves <key>",
			"Jira issue key resolved by this PR, appended to ## Why (repeatable)",
			collect,
			[],
		)
		.option(
			"--force",
			"Overwrite the title and body of an existing pull request",
		)
		.option("-B, --base <branch>", "Branch into which the pull request merges")
		.option("-H, --head <branch>", "Branch that contains the commits")
		.option("-d, --draft", "Mark the pull request as a draft")
		.option("-w, --web", "Open the browser to create the pull request")
		.option("-l, --label <label>", "Add a label (repeatable)", collect, [])
		.option(
			"-a, --assignee <login>",
			"Assign a person by login (repeatable)",
			collect,
			[],
		)
		.option(
			"-r, --reviewer <handle>",
			"Request a review (repeatable)",
			collect,
			[],
		)
		.option("-m, --milestone <name>", "Add the pull request to a milestone")
		.action(prsRaise);
}
