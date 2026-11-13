import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { internalCommand } from "../../shared/internalCommand";
import { registerNodes } from "./nodes/registerNodes";
import { registerOutputCommand } from "./registerOutputCommand";
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

	internalCommand(
		cmd
			.command("close")
			.description(
				"Dismiss the current daemon-managed session, ending it and reaping its worktree",
			)
			.action(lazyAction(() => import("./closeSession"), "closeSession")),
		"/close",
	);

	internalCommand(
		cmd
			.command("rename <title>")
			.description(
				"Retitle the current daemon-managed session, overriding the generated title for the rest of its life",
			)
			.action(lazyAction(() => import("./renameSession"), "renameSession")),
		"/rename",
	);

	registerOutputCommand(cmd);
	registerSetStatusCommand(cmd);
	registerNodes(cmd);

	configHelp(cmd, [...sessionsConfigHelp, ...harnessDefaultsConfigHelp]);
}
