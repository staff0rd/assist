import type { Command } from "commander";
import {
	add as backlogAdd,
	del as backlogDel,
	done as backlogDone,
	init as backlogInit,
	list as backlogList,
	next as backlogNext,
	phaseDone as backlogPhaseDone,
	plan as backlogPlan,
	runPlan as backlogRun,
	start as backlogStart,
	web as backlogWeb,
} from "./backlog";

function registerItemCommands(cmd: Command): void {
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

function registerStatusCommands(cmd: Command): void {
	cmd
		.command("start <id>")
		.description("Set a backlog item to in-progress")
		.action(backlogStart);

	cmd
		.command("done <id>")
		.description("Set a backlog item to done")
		.action(backlogDone);

	cmd
		.command("delete <id>")
		.description("Delete a backlog item")
		.action(backlogDel);

	cmd
		.command("web")
		.description("Start a web view of the backlog")
		.option("-p, --port <number>", "Port to listen on", "3000")
		.action(backlogWeb);
}

function registerOrchestrationCommands(cmd: Command): void {
	cmd
		.command("next")
		.description("Pick and run the next backlog item, or open /draft if none")
		.action(backlogNext);

	cmd
		.command("plan <id>")
		.description("Display the plan for a backlog item")
		.action(backlogPlan);

	cmd
		.command("phase-done <id> <phase>")
		.description("Signal that a plan phase is complete")
		.action(backlogPhaseDone);

	cmd
		.command("run <id>")
		.description("Run a backlog item's plan phase-by-phase with Claude")
		.action(backlogRun);
}

export function registerBacklog(program: Command): void {
	const cmd = program
		.command("backlog")
		.description("Manage a backlog of work items")
		.action(() => backlogWeb({ port: "3000" }));

	registerItemCommands(cmd);
	registerStatusCommands(cmd);
	registerOrchestrationCommands(cmd);
}
