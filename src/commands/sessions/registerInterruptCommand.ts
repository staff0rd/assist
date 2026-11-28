import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { lazyAction } from "../../shared/lazyAction";
import { sessionIdHelp } from "./sessionIdHelp";

export function registerInterruptCommand(cmd: Command): void {
	internalCommand(
		cmd
			.command("interrupt")
			.description(
				"Interrupt the running turn of a Claude session (the current one by default)",
			)
			.option("--id <id>", sessionIdHelp)
			.action(
				lazyAction(() => import("./interruptSession"), "interruptSession"),
			),
		"agents driving other sessions",
	);
}
