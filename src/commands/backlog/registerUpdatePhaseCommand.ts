import type { Command } from "commander";
import { updatePhase } from "./updatePhase";

function collect(value: string, previous: string[]): string[] {
	return [...previous, value];
}

export function registerUpdatePhaseCommand(cmd: Command): void {
	cmd
		.command("update-phase <id> <phase>")
		.alias("edit-phase")
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
}
