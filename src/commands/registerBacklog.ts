import type { Command } from "commander";
import {
	del as backlogDel,
	done as backlogDone,
	next as backlogNext,
	phaseDone as backlogPhaseDone,
	plan as backlogPlan,
	runPlan as backlogRun,
	show as backlogShow,
	start as backlogStart,
	web as backlogWeb,
} from "./backlog";
import { registerCommentCommands } from "./backlog/registerCommentCommands";
import { registerItemCommands } from "./backlog/registerItemCommands";

function registerShowCommands(cmd: Command): void {
	cmd
		.command("show <id>")
		.alias("view")
		.description("Show full detail for a backlog item")
		.action(backlogShow);
}

function registerStatusCommands(cmd: Command): void {
	cmd
		.command("start <id>")
		.description("Set a backlog item to in-progress")
		.action(backlogStart);

	cmd
		.command("done <id> [summary]")
		.description("Set a backlog item to done")
		.action(backlogDone);

	cmd
		.command("delete <id>")
		.alias("remove")
		.description("Delete a backlog item")
		.action(backlogDel);
}

function registerWebCommand(cmd: Command): void {
	cmd
		.command("web")
		.description("Start a web view of the backlog")
		.option("-p, --port <number>", "Port to listen on", "3000")
		.action(backlogWeb);
}

function registerPlanCommands(cmd: Command): void {
	cmd
		.command("plan <id>")
		.description("Display the plan for a backlog item")
		.action(backlogPlan);

	cmd
		.command("phase-done <id> <phase> <summary>")
		.description("Signal that a plan phase is complete")
		.action(backlogPhaseDone);
}

function registerNextCommand(cmd: Command): void {
	cmd
		.command("next")
		.description("Pick and run the next backlog item, or open /draft if none")
		.option("-w, --write", "Run Claude with acceptEdits permission mode")
		.action((opts: { write?: boolean }) =>
			backlogNext({ allowEdits: opts.write }),
		);
}

function registerRunCommand(cmd: Command): void {
	cmd
		.command("run <id>")
		.description("Run a backlog item's plan phase-by-phase with Claude")
		.option("-w, --write", "Run Claude with acceptEdits permission mode")
		.action((id: string, opts: { write?: boolean }) =>
			backlogRun(id, { allowEdits: opts.write }),
		);
}

export function registerBacklog(program: Command): void {
	const cmd = program
		.command("backlog")
		.description("Manage a backlog of work items")
		.action(() => backlogWeb({ port: "3000" }));

	registerItemCommands(cmd);
	registerShowCommands(cmd);
	registerStatusCommands(cmd);
	registerWebCommand(cmd);
	registerCommentCommands(cmd);
	registerPlanCommands(cmd);
	registerNextCommand(cmd);
	registerRunCommand(cmd);
}
