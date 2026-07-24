import type { Command } from "commander";
import { addActivity } from "./addActivity";
import { recordSlack } from "./recordSlack";

export function registerActivityCommands(cmd: Command): void {
	cmd
		.command("add-activity <id> <kind> <ref>")
		.description(
			"Attach an activity ref (branch|commit|pr|slack) to a backlog item",
		)
		.option("--title <title>", "Title metadata for the ref")
		.option("--url <url>", "URL metadata (auto-filled for branch/commit)")
		.option("--state <state>", "State metadata for the ref")
		.action(addActivity);

	cmd
		.command("record-slack <url>")
		.description(
			"Attach a Slack thread permalink to the current session's backlog item",
		)
		.option("--title <title>", "PR title to label the ref with")
		.action(recordSlack);
}
