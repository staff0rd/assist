import type { Command } from "commander";
import { addSubtask as backlogAddSubtask } from "./addSubtask";
import { subtaskStatus as backlogSubtaskStatus } from "./subtaskStatus";

export function registerSubtaskCommands(cmd: Command): void {
	cmd
		.command("add-subtask <id>")
		.description("Add a sub-task to an existing backlog item")
		.requiredOption("--title <title>", "Sub-task title")
		.option(
			"--desc <description>",
			String.raw`Sub-task description (Markdown supported; use \n for line breaks)`,
		)
		.action(backlogAddSubtask);

	cmd
		.command("subtask-status <id> <idx> <status>")
		.description(
			"Set a sub-task's status (todo, in-progress, done) by its 1-based index",
		)
		.action(backlogSubtaskStatus);
}
