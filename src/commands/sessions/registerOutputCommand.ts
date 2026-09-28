import type { Command } from "commander";
import { sessionOutput } from "./sessionOutput";

export function registerOutputCommand(cmd: Command): void {
	cmd
		.command("output [session-id]")
		.description(
			"Print a snapshot of a session's output with ANSI codes stripped",
		)
		.option("-n, --lines <count>", "Number of lines", "200")
		.option(
			"--server [group]",
			"Read the live server run for this repo's remote and group (default: default)",
		)
		.action(sessionOutput);
}
