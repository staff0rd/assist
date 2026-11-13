import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { backlogConfigHelp } from "./backlog/backlogConfigHelp";
import { markAgentCommands } from "./backlog/markAgentCommands";
import { registerActivityCommands } from "./backlog/registerActivityCommands";
import { registerAssociateGithubCommand } from "./backlog/registerAssociateGithubCommand";
import { registerAssociateJiraCommand } from "./backlog/registerAssociateJiraCommand";
import { registerCloneCommand } from "./backlog/registerCloneCommand";
import { registerCommentCommands } from "./backlog/registerCommentCommands";
import { registerExportCommand } from "./backlog/registerExportCommand";
import { registerImportCommand } from "./backlog/registerImportCommand";
import { registerItemCommands } from "./backlog/registerItemCommands";
import { registerLinkCommands } from "./backlog/registerLinkCommands";
import { registerMoveRepoCommand } from "./backlog/registerMoveRepoCommand";
import { registerNextCommand } from "./backlog/registerNextCommand";
import { registerPlanCommands } from "./backlog/registerPlanCommands";
import { registerRefineCommand } from "./backlog/registerRefineCommand";
import { registerRefreshDocsCommand } from "./backlog/registerRefreshDocsCommand";
import { registerRewindCommand } from "./backlog/registerRewindCommand";
import { registerRunCommand } from "./backlog/registerRunCommand";
import { registerSearchCommand } from "./backlog/registerSearchCommand";
import { registerStatusCommands } from "./backlog/registerStatusCommands";
import { registerUpdateCommands } from "./backlog/registerUpdateCommands";
import { registerShowCommands } from "./backlog/registerShowCommands";
import { lazyAction } from "../shared/lazyAction";

function registerWebCommand(cmd: Command): void {
	cmd
		.command("web")
		.description("Open the backlog tab in the web dashboard")
		.option("-p, --port <number>", "Port to listen on", "3100")
		.option("--no-open", "Do not open a browser on startup")
		.action(lazyAction(() => import("./backlog/web"), "web"));
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
	registerRefreshDocsCommand,
	registerRunCommand,
	registerSearchCommand,
	registerUpdateCommands,
	registerExportCommand,
	registerImportCommand,
	registerMoveRepoCommand,
	registerCloneCommand,
	registerAssociateJiraCommand,
	registerAssociateGithubCommand,
	registerActivityCommands,
];

export function registerBacklog(program: Command): void {
	const cmd = program
		.command("backlog")
		.description("Manage a backlog of work items")
		.option("--dir <path>", "Override directory for backlog file discovery")
		.option("--no-open", "Do not open a browser on startup")
		.hook("preAction", async (thisCommand) => {
			const { setBacklogDir } = await import("./backlog/getBacklogDir");
			setBacklogDir(thisCommand.opts().dir);
		})
		.action(async (options) =>
			(await import("./backlog/web")).web({ port: "3100", open: options.open }),
		);

	for (const register of registrars) {
		register(cmd);
	}
	markAgentCommands(cmd);

	configHelp(cmd, backlogConfigHelp);
}
