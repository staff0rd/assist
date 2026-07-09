import type { Command } from "commander";
import { movePhase } from "./movePhase";
import { registerUpdatePhaseCommand } from "./registerUpdatePhaseCommand";
import { removePhase } from "./removePhase";
import { update } from "./update";

function collect(value: string, previous: string[]): string[] {
	return [...previous, value];
}

export function registerUpdateCommands(cmd: Command): void {
	cmd
		.command("update-field <id>")
		.description("Update fields on a backlog item")
		.option("--name <name>", "New item name")
		.option(
			"--desc <description>",
			String.raw`New description (Markdown supported; use \n for line breaks)`,
		)
		.option("--type <type>", "New type (story or bug)")
		.option("--ac <criterion...>", "Replace acceptance criteria (repeatable)")
		.option(
			"--add-ac <text>",
			"Append one acceptance criterion (repeatable)",
			collect,
			[],
		)
		.option(
			"--edit-ac <n> <text...>",
			"Replace acceptance criterion n (1-based) in place",
		)
		.option("--remove-ac <n>", "Remove acceptance criterion n (1-based)")
		.action(update);

	registerUpdatePhaseCommand(cmd);

	cmd
		.command("remove-phase <id> <phase>")
		.description("Remove a plan phase from a backlog item")
		.action(removePhase);

	cmd
		.command("move-phase <id> <from> <to>")
		.description(
			"Reorder a plan phase from one 1-based position to another, moving its tasks with it",
		)
		.action(movePhase);
}
