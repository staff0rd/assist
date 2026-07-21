import type { Command } from "commander";
import { setSessionStatus } from "./setSessionStatus";

export function registerSetStatusCommand(cmd: Command): void {
	cmd
		.command("set-status <status>")
		.description(
			"Report the current session's status to the sessions daemon (used by Claude Code hooks)",
		)
		.option(
			"--source <source>",
			"Originating hook (permission, stop, notification, prompt, pretool, posttool)",
		)
		.option(
			"--ack",
			"Wait for the daemon to acknowledge delivery, retrying on failure",
		)
		.action((status, options) =>
			setSessionStatus(status, { source: options.source, ack: options.ack }),
		);
}
