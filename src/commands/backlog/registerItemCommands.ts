import type { Command } from "commander";
import { add as backlogAdd } from "./add";
import { init as backlogInit } from "./init";
import { list as backlogList } from "./list";

export function registerItemCommands(cmd: Command): void {
	cmd
		.command("init")
		.description("Create an empty assist.backlog.yml")
		.action(backlogInit);

	cmd
		.command("list")
		.description("List all backlog items")
		.option("--status <type>", "Filter by status (todo, in-progress, done)")
		.option("-a, --all", "Include done items")
		.option("-v, --verbose", "Show all item details")
		.action(backlogList);

	cmd
		.command("add")
		.description("Add a new backlog item")
		.option("--json", "Read item as JSON from stdin")
		.action(backlogAdd);
}
