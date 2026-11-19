import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";
import { sessionIdHelp } from "./sessionIdHelp";

export function registerInterruptCommand(cmd: Command): void {
	cmd
		.command("interrupt")
		.description(
			"Interrupt the running turn of a Claude session (the current one by default)",
		)
		.option("--id <id>", sessionIdHelp)
		.action(lazyAction(() => import("./interruptSession"), "interruptSession"));
}
