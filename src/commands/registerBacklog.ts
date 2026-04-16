import type { Command } from "commander";
import {
	next as backlogNext,
	phaseDone as backlogPhaseDone,
	plan as backlogPlan,
	show as backlogShow,
	web as backlogWeb,
} from "./backlog";
import { registerCommentCommands } from "./backlog/registerCommentCommands";
import { registerItemCommands } from "./backlog/registerItemCommands";
import { registerLinkCommands } from "./backlog/registerLinkCommands";
import { registerRewindCommand } from "./backlog/registerRewindCommand";
import { registerRunCommand } from "./backlog/registerRunCommand";
import { registerSearchCommand } from "./backlog/registerSearchCommand";
import { registerStatusCommands } from "./backlog/registerStatusCommands";
import { registerUpdateCommands } from "./backlog/registerUpdateCommands";
import { setBacklogDir } from "./backlog/shared";

function registerShowCommands(cmd: Command): void {
	cmd
		.command("show <id>")
		.alias("view")
		.description("Show full detail for a backlog item")
		.action(backlogShow);
}

function registerWebCommand(cmd: Command): void {
	cmd
		.command("web")
		.description("Open the backlog tab in the web dashboard")
		.option("-p, --port <number>", "Port to listen on", "3100")
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

export function registerBacklog(program: Command): void {
	const cmd = program
		.command("backlog")
		.description("Manage a backlog of work items")
		.option("--dir <path>", "Override directory for backlog file discovery")
		.hook("preAction", (thisCommand) => {
			setBacklogDir(thisCommand.opts().dir);
		})
		.action(() => backlogWeb({ port: "3100" }));

	registerItemCommands(cmd);
	registerShowCommands(cmd);
	registerStatusCommands(cmd);
	registerWebCommand(cmd);
	registerCommentCommands(cmd);
	registerLinkCommands(cmd);
	registerPlanCommands(cmd);
	registerRewindCommand(cmd);
	registerNextCommand(cmd);
	registerRunCommand(cmd);
	registerSearchCommand(cmd);
	registerUpdateCommands(cmd);
}
