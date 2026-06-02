import type { Command } from "commander";
import { removePhase } from "./removePhase";
import { update } from "./update";
import { updatePhase } from "./updatePhase";

function collect(value: string, previous: string[]): string[] {
	return [...previous, value];
}

export function registerUpdateCommands(cmd: Command): void {
	cmd
		.command("update-field <id>")
		.description("Update fields on a backlog item")
		.option("--name <name>", "New item name")
		.option("--desc <description>", "New description")
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

	cmd
		.command("update-phase <id> <phase>")
		.description("Modify a plan phase on a backlog item")
		.option("--name <name>", "New phase name")
		.option("--task <task...>", "Replace tasks (repeatable)")
		.option("--manual-check <check...>", "Replace manual checks (repeatable)")
		.option("--add-task <text>", "Append one task (repeatable)", collect, [])
		.option("--edit-task <n> <text...>", "Replace task n (1-based) in place")
		.option("--remove-task <n>", "Remove task n (1-based)")
		.option(
			"--add-check <text>",
			"Append one manual check (repeatable)",
			collect,
			[],
		)
		.option(
			"--edit-check <n> <text...>",
			"Replace manual check n (1-based) in place",
		)
		.option("--remove-check <n>", "Remove manual check n (1-based)")
		.action(updatePhase);

	cmd
		.command("remove-phase <id> <phase>")
		.description("Remove a plan phase from a backlog item")
		.action(removePhase);
}
