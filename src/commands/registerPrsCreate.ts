import type { Command } from "commander";
import { create as prsCreate } from "./prs/index";

function collect(value: string, previous: string[]): string[] {
	return previous.concat([value]);
}

export function registerPrsCreate(prsCommand: Command): void {
	prsCommand
		.command("create")
		.description(
			"Create a pull request via gh pr create, validating the title and body first",
		)
		.option("-t, --title <title>", "Title for the pull request")
		.option("-b, --body <body>", "Body for the pull request")
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
		.action(prsCreate);
}
