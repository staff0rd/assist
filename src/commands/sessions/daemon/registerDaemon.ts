import type { Command } from "commander";
import { daemonStatus } from "./daemonStatus";
import { restartDaemon } from "./restartDaemon";
import { runDaemon } from "./runDaemon";
import { stopDaemon } from "./stopDaemon";

export function registerDaemon(program: Command): void {
	const cmd = program
		.command("daemon")
		.description("Long-lived daemon that owns web session PTYs");

	cmd
		.command("run")
		.description(
			"Run the sessions daemon in the foreground (auto-spawned by assist sessions)",
		)
		.action(runDaemon);

	cmd
		.command("status")
		.description("Show sessions daemon status and live sessions")
		.action(daemonStatus);

	cmd
		.command("stop")
		.description(
			"Stop the sessions daemon; running claude sessions resume on next start",
		)
		.action(stopDaemon);

	cmd
		.command("restart")
		.description(
			"Restart the sessions daemon, resuming previously running claude sessions",
		)
		.action(restartDaemon);
}
