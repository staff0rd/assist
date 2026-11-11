import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { sessionOutput } from "./sessionOutput";

export function registerOutputCommand(cmd: Command): void {
	internalCommand(
		cmd
			.command("output")
			.argument(
				"[session-id]",
				"Local session id, or <node>:<id> for a session on a linked node (read over the node link)",
			)
			.description(
				"Print a snapshot of a session's output with ANSI codes stripped",
			)
			.option("-n, --lines <count>", "Number of lines", "200")
			.option(
				"--server [group]",
				"Read the live server run for this repo's remote and group (default: default)",
			)
			.action(sessionOutput),
		"/run-logs",
	);
}
