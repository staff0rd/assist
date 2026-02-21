import type { Command } from "commander";
import {
	add as backlogAdd,
	done as backlogDone,
	init as backlogInit,
	list as backlogList,
	start as backlogStart,
	web as backlogWeb,
} from "./backlog";

export function registerBacklog(program: Command): void {
	const backlogCommand = program
		.command("backlog")
		.description("Manage a backlog of work items")
		.action(backlogList);

	backlogCommand
		.command("init")
		.description("Create an empty assist.backlog.yml")
		.action(backlogInit);

	backlogCommand
		.command("list")
		.description("List all backlog items")
		.option("--status <type>", "Filter by status (todo, in-progress, done)")
		.option("-v, --verbose", "Show all item details")
		.action(backlogList);

	backlogCommand
		.command("add")
		.description("Add a new backlog item")
		.action(backlogAdd);

	backlogCommand
		.command("start <id>")
		.description("Set a backlog item to in-progress")
		.action(backlogStart);

	backlogCommand
		.command("done <id>")
		.description("Set a backlog item to done")
		.action(backlogDone);

	backlogCommand
		.command("web")
		.description("Start a web view of the backlog")
		.option("-p, --port <number>", "Port to listen on", "3000")
		.action(backlogWeb);
}
