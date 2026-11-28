import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { configHelp } from "../../shared/configHelp";
import { registerNodes } from "./nodes/registerNodes";
import { registerInterruptCommand } from "./registerInterruptCommand";
import { registerCloseRenameCommands } from "./registerCloseRenameCommands";
import { registerOutputCommand } from "./registerOutputCommand";
import { registerPreviewCommands } from "./previews/registerPreviewCommands";
import { registerSendCommand } from "./registerSendCommand";
import { registerSetStatusCommand } from "./registerSetStatusCommand";
import { registerSessionsWeb } from "./registerSessionsWeb";
import { harnessDefaultsConfigHelp } from "../backlog/harnessDefaultsConfigHelp";
import { sessionsConfigHelp } from "./sessionsConfigHelp";
import { lazyAction } from "../../shared/lazyAction";

export function registerSessions(program: Command): void {
	const cmd = program
		.command("sessions")
		.description("Web dashboard for coding agent sessions")
		.option("--no-open", "Do not open a browser on startup")
		.action(async (_options, command) =>
			(await import("./web")).web({
				port: "3100",
				open: command.optsWithGlobals().open,
			}),
		);

	registerSessionsWeb(cmd);

	registerCloseRenameCommands(cmd);
	registerInterruptCommand(cmd);

	internalCommand(
		cmd
			.command("list")
			.description(
				"List every session on this node and linked nodes, with the ids other sessions commands accept",
			)
			.option("--json", "Print the sessions as JSON")
			.option(
				"--node <name>",
				"Only list sessions on this node (local for this one)",
			)
			.action(lazyAction(() => import("./list/listSessions"), "listSessions")),
		"agents driving other sessions",
	);

	registerOutputCommand(cmd);
	registerPreviewCommands(cmd);
	registerSendCommand(cmd);
	registerSetStatusCommand(cmd);
	registerNodes(cmd);

	configHelp(cmd, [...sessionsConfigHelp, ...harnessDefaultsConfigHelp]);
}
