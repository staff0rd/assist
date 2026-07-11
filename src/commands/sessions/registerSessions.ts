import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { setSessionStatus } from "./setSessionStatus";
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
		.command("set-status <status>")
		.description(
			"Report the current session's status to the sessions daemon (used by Claude Code hooks)",
		)
		.action(setSessionStatus);

	configHelp(cmd, [
		{
			key: "sessions.windowsProjectsRoot",
			setter:
				"assist config set sessions.windowsProjectsRoot /mnt/c/Users/you/.claude/projects",
			note: "WSL path to the Windows .claude/projects root to discover",
		},
		{
			key: "sessions.windowsDaemonHost",
			setter: "assist config set sessions.windowsDaemonHost 127.0.0.1",
			note: "host the WSL daemon dials to reach the Windows daemon (default: 127.0.0.1)",
		},
		{
			key: "sessions.windowsDaemonPort",
			setter: "assist config set sessions.windowsDaemonPort 51764",
			note: "TCP port the Windows daemon listens on (default: 51764)",
		},
		{
			key: "sessions.windowsVersionCheck",
			setter: "assist config set sessions.windowsVersionCheck block",
			note: "Windows daemon version mismatch handling: block | warn | off",
		},
	]);
}
