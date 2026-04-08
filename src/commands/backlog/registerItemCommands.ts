import type { Command } from "commander";
import { add as backlogAdd } from "./add";
import { addPhase as backlogAddPhase } from "./addPhase";
import { init as backlogInit } from "./init";
import { list as backlogList } from "./list";

export function registerItemCommands(cmd: Command): void {
	cmd
		.command("init")
		.description("Create an empty backlog")
		.action(backlogInit);

	cmd
		.command("list")
		.alias("ls")
		.description("List all backlog items")
		.option(
			"--status <type>",
			"Filter by status (todo, in-progress, done, wontdo)",
		)
		.option("-a, --all", "Include done/wontdo items")
		.option("-v, --verbose", "Show all item details")
		.action(backlogList);

	cmd
		.command("add")
		.description("Add a new backlog item")
		.option("--name <name>", "Item name")
		.option("--type <type>", "Item type (story or bug)")
		.option("--desc <description>", "Item description")
		.option("--ac <criterion...>", "Acceptance criteria (repeatable)")
		.action(backlogAdd);

	cmd
		.command("add-phase <id> <name>")
		.description("Add a phase to an existing backlog item")
		.option("--task <task...>", "Task description (repeatable)")
		.option(
			"--manual-check <check...>",
			"Manual check description (repeatable)",
		)
		.option(
			"--position <position>",
			"1-indexed position to insert at (default: append)",
		)
		.action(backlogAddPhase);
}
