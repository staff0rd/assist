import type { Command } from "commander";
import {
	next as backlogNext,
	show as backlogShow,
	web as backlogWeb,
} from "./backlog";
import { refine as backlogRefine } from "./backlog/refine";
import { registerCommentCommands } from "./backlog/registerCommentCommands";
import { registerExportCommand } from "./backlog/registerExportCommand";
import { registerImportCommand } from "./backlog/registerImportCommand";
import { registerItemCommands } from "./backlog/registerItemCommands";
import { registerLinkCommands } from "./backlog/registerLinkCommands";
import { registerMoveRepoCommand } from "./backlog/registerMoveRepoCommand";
import { registerPlanCommands } from "./backlog/registerPlanCommands";
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

function registerRefineCommand(cmd: Command): void {
	cmd
		.command("refine")
		.argument("[id]", "Backlog item ID")
		.description("Alias for refine")
		.action((id: string | undefined) => backlogRefine(id));
}

function registerNextCommand(cmd: Command): void {
	cmd
		.command("next")
		.argument("[id]", "Backlog item ID to run first")
		.description("Pick and run the next backlog item, or open /draft if none")
		.option("-w, --write", "Run Claude with auto permission mode (default)")
		.option("--no-write", "Run Claude without auto permission mode")
		.action((id: string | undefined, opts: { write?: boolean }) =>
			backlogNext({ allowEdits: opts.write !== false }, id),
		);
}

const registrars = [
	registerItemCommands,
	registerShowCommands,
	registerStatusCommands,
	registerWebCommand,
	registerCommentCommands,
	registerLinkCommands,
	registerPlanCommands,
	registerRewindCommand,
	registerNextCommand,
	registerRefineCommand,
	registerRunCommand,
	registerSearchCommand,
	registerUpdateCommands,
	registerExportCommand,
	registerImportCommand,
	registerMoveRepoCommand,
];

export function registerBacklog(program: Command): void {
	const cmd = program
		.command("backlog")
		.description("Manage a backlog of work items")
		.option("--dir <path>", "Override directory for backlog file discovery")
		.hook("preAction", (thisCommand) => {
			setBacklogDir(thisCommand.opts().dir);
		})
		.action(() => backlogWeb({ port: "3100" }));

	for (const register of registrars) {
		register(cmd);
	}
}
