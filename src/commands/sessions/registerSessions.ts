import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { closeSession } from "./closeSession";
import { registerSetStatusCommand } from "./registerSetStatusCommand";
import { renameSession } from "./renameSession";
import { sessionsConfigHelp } from "./sessionsConfigHelp";
import { summarise } from "./summarise";
import { web as sessionsWeb } from "./web";

export function registerSessions(program: Command): void {
	const cmd = program
		.command("sessions")
		.description("Web dashboard for Claude Code sessions")
		.option("--no-open", "Do not open a browser on startup")
		.action((_options, command) =>
			sessionsWeb({ port: "3100", open: command.optsWithGlobals().open }),
		);

	cmd
		.command("web")
		.description("Start the sessions web dashboard")
		.option("-p, --port <number>", "Port to listen on", "3100")
		.option("--no-open", "Do not open a browser on startup")
		.action((options, command) =>
			sessionsWeb({ ...options, open: command.optsWithGlobals().open }),
		);

	cmd
		.command("summarise")
		.description("Generate one-line summaries for Claude sessions")
		.option("-f, --force", "Re-generate all summaries, even existing ones")
		.option("-n, --limit <count>", "Maximum number of sessions to summarise")
		.action(summarise);

	cmd
		.command("close")
		.description(
			"Dismiss the current daemon-managed session, ending it and reaping its worktree",
		)
		.action(closeSession);

	cmd
		.command("rename <title>")
		.description(
			"Retitle the current daemon-managed session, overriding the generated title for the rest of its life",
		)
		.action(renameSession);

	registerSetStatusCommand(cmd);

	configHelp(cmd, sessionsConfigHelp);
}
