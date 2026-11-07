import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { setSessionStatus } from "./setSessionStatus";

export function registerSetStatusCommand(cmd: Command): void {
	internalCommand(
		cmd
			.command("set-status <status>")
			.description(
				"Report the current session's status to the sessions daemon (used by Claude Code and Codex hooks)",
			)
			.option(
				"--source <source>",
				"Originating hook (permission, stop, notification, prompt, pretool, posttool)",
			)
			.option(
				"--ack",
				"Retry delivery until the daemon acknowledges it (without it, a single attempt)",
			)
			.action((status, options) =>
				setSessionStatus(status, { source: options.source, ack: options.ack }),
			),
		"Claude and Codex hooks",
	);
}
