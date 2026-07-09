import type { Command } from "commander";
import { addSubtask as backlogAddSubtask } from "./addSubtask";
import { editSubtask as backlogEditSubtask } from "./editSubtask";
import { removeSubtask as backlogRemoveSubtask } from "./removeSubtask";
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
		.command("edit-subtask <id> <idx>")
		.description(
			"Edit a sub-task's title, description, and/or status by its 1-based index",
		)
		.option("--title <title>", "New sub-task title")
		.option(
			"--desc <description>",
			String.raw`New sub-task description (Markdown supported; use \n for line breaks; pass "" to clear)`,
		)
		.option("--status <status>", "New status (todo, in-progress, done)")
		.action(backlogEditSubtask);

	cmd
		.command("remove-subtask <id> <idx>")
		.description(
			"Remove a sub-task by its 1-based index and re-index the remaining sub-tasks",
		)
		.action(backlogRemoveSubtask);

	cmd
		.command("subtask-status <id> <idx> <status>")
		.description(
			"Set a sub-task's status (todo, in-progress, done) by its 1-based index",
		)
		.action(backlogSubtaskStatus);
}
