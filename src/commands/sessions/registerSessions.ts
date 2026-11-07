import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { internalCommand } from "../../shared/internalCommand";
import { closeSession } from "./closeSession";
import { registerNodes } from "./nodes/registerNodes";
import { registerOutputCommand } from "./registerOutputCommand";
import { registerSetStatusCommand } from "./registerSetStatusCommand";
import { renameSession } from "./renameSession";
import { nextConfigHelp } from "./nextConfigHelp";
import { sessionsConfigHelp } from "./sessionsConfigHelp";
import { web as sessionsWeb } from "./web";
import { hotkeysConfigHelp } from "./hotkeysConfigHelp";
import { webConfigHelp } from "./webConfigHelp";

export function registerSessions(program: Command): void {
	const cmd = program
		.command("sessions")
		.description("Web dashboard for coding agent sessions")
		.option("--no-open", "Do not open a browser on startup")
		.action((_options, command) =>
			sessionsWeb({ port: "3100", open: command.optsWithGlobals().open }),
		);

	const webCmd = cmd
		.command("web")
		.description("Start the sessions web dashboard")
		.option("-p, --port <number>", "Port to listen on", "3100")
		.option("--no-open", "Do not open a browser on startup")
		.action((options, command) =>
			sessionsWeb({ ...options, open: command.optsWithGlobals().open }),
		);
	configHelp(webCmd, [
		...nextConfigHelp,
		...webConfigHelp,
		...hotkeysConfigHelp,
	]);

	internalCommand(
		cmd
			.command("close")
			.description(
				"Dismiss the current daemon-managed session, ending it and reaping its worktree",
			)
			.action(closeSession),
		"/close",
	);

	internalCommand(
		cmd
			.command("rename <title>")
			.description(
				"Retitle the current daemon-managed session, overriding the generated title for the rest of its life",
			)
			.action(renameSession),
		"/rename",
	);

	registerOutputCommand(cmd);
	registerSetStatusCommand(cmd);
	registerNodes(cmd);

	configHelp(cmd, sessionsConfigHelp);
}
