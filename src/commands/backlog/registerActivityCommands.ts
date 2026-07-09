import type { Command } from "commander";
import { addActivity } from "./addActivity";

export function registerActivityCommands(cmd: Command): void {
	cmd
		.command("add-activity <id> <kind> <ref>")
		.description(
			"Attach a git activity ref (branch|commit|pr) to a backlog item",
		)
		.option("--title <title>", "Title metadata for the ref")
		.option("--url <url>", "URL metadata (auto-filled for branch/commit)")
		.option("--state <state>", "State metadata for the ref")
		.action(addActivity);
}
