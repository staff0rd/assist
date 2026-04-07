import type { Command } from "commander";
import { removePhase } from "./removePhase";
import { update } from "./update";
import { updatePhase } from "./updatePhase";

export function registerUpdateCommands(cmd: Command): void {
	cmd
		.command("update <id>")
		.description("Update fields on a backlog item")
		.option("--name <name>", "New item name")
		.option("--desc <description>", "New description")
		.option("--type <type>", "New type (story or bug)")
		.option("--ac <criterion...>", "Replace acceptance criteria (repeatable)")
		.action(update);

	cmd
		.command("update-phase <id> <phase>")
		.description("Modify a plan phase on a backlog item")
		.option("--name <name>", "New phase name")
		.option("--task <task...>", "Replace tasks (repeatable)")
		.option("--manual-check <check...>", "Replace manual checks (repeatable)")
		.action(updatePhase);

	cmd
		.command("remove-phase <id> <phase>")
		.description("Remove a plan phase from a backlog item")
		.action(removePhase);
}
