import type { Command } from "commander";
import { configHelp } from "../../../shared/configHelp";
import { autoUpdateConfigHelp } from "./autoUpdateConfigHelp";
import { lazyAction } from "../../../shared/lazyAction";

export function registerDaemon(program: Command): void {
	const cmd = program
		.command("daemon")
		.description("Long-lived daemon that owns web session PTYs");

	cmd
		.command("run")
		.description(
			"Run the sessions daemon in the foreground (auto-spawned by assist sessions)",
		)
		.action(lazyAction(() => import("./runDaemon"), "runDaemon"));

	cmd
		.command("status")
		.description(
			"Show sessions daemon status, live sessions, and any stray daemon processes",
		)
		.action(lazyAction(() => import("./daemonStatus"), "daemonStatus"));

	cmd
		.command("stop")
		.description(
			"Stop the sessions daemon; running claude sessions resume on next start",
		)
		.action(lazyAction(() => import("./stopDaemon"), "stopDaemon"));

	cmd
		.command("restart")
		.description(
			"Restart the sessions daemon, resuming previously running claude sessions",
		)
		.action(lazyAction(() => import("./restartDaemon"), "restartDaemon"));

	cmd
		.command("drain")
		.description(
			"Remove all sessions from the local daemon for a clean slate (does not affect the Windows daemon); prompts before closing live sessions, and a session holding unpushed work is stopped, not removed",
		)
		.option("--yes", "Close live sessions without confirming")
		.action(async (options: { yes?: boolean }) =>
			(await import("./drainDaemon")).drainDaemon(options),
		);

	configHelp(cmd, autoUpdateConfigHelp);
}
