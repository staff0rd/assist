import type { Command } from "commander";
import { show as backlogShow, web as backlogWeb } from "./backlog";
import { registerAssociateJiraCommand } from "./backlog/registerAssociateJiraCommand";
import { registerCommentCommands } from "./backlog/registerCommentCommands";
import { registerExportCommand } from "./backlog/registerExportCommand";
import { registerImportCommand } from "./backlog/registerImportCommand";
import { registerItemCommands } from "./backlog/registerItemCommands";
import { registerLinkCommands } from "./backlog/registerLinkCommands";
import { registerMoveRepoCommand } from "./backlog/registerMoveRepoCommand";
import { registerNextCommand } from "./backlog/registerNextCommand";
import { registerPlanCommands } from "./backlog/registerPlanCommands";
import { registerRefineCommand } from "./backlog/registerRefineCommand";
import { registerRewindCommand } from "./backlog/registerRewindCommand";
import { registerRunCommand } from "./backlog/registerRunCommand";
import { registerSearchCommand } from "./backlog/registerSearchCommand";
import { registerStatusCommands } from "./backlog/registerStatusCommands";
import { registerSubtaskCommands } from "./backlog/registerSubtaskCommands";
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
		.option("--no-open", "Do not open a browser on startup")
		.action(backlogWeb);
}

const registrars = [
	registerItemCommands,
	registerShowCommands,
	registerStatusCommands,
	registerSubtaskCommands,
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
	registerAssociateJiraCommand,
];

export function registerBacklog(program: Command): void {
	const cmd = program
		.command("backlog")
		.description("Manage a backlog of work items")
		.option("--dir <path>", "Override directory for backlog file discovery")
		.option("--no-open", "Do not open a browser on startup")
		.hook("preAction", (thisCommand) => {
			setBacklogDir(thisCommand.opts().dir);
		})
		.action((options) => backlogWeb({ port: "3100", open: options.open }));

	for (const register of registrars) {
		register(cmd);
	}
}
