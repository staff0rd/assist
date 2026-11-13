import type { Command } from "commander";
import { registerProposeCommand } from "./registerProposeCommand";
import { lazyAction } from "../../shared/lazyAction";

export function registerItemCommands(cmd: Command): void {
	cmd
		.command("list")
		.alias("ls")
		.description("List all backlog items")
		.option(
			"--status <type>",
			"Filter by status (todo, in-progress, done, wontdo)",
		)
		.option("-a, --all", "Include done/wontdo items")
		.option("--all-repos", "List items across all repositories")
		.option("-v, --verbose", "Show all item details")
		.action(lazyAction(() => import("./list"), "list"));

	cmd
		.command("add")
		.description("Add a new backlog item")
		.option("--name <name>", "Item name")
		.option("--type <type>", "Item type (story or bug)")
		.option(
			"--desc <description>",
			String.raw`Item description (Markdown supported; use \n for line breaks)`,
		)
		.option("--ac <criterion...>", "Acceptance criteria (repeatable)")
		.action(lazyAction(() => import("./add"), "add"));

	registerProposeCommand(cmd);

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
		.action(lazyAction(() => import("./addPhase"), "addPhase"));
}
