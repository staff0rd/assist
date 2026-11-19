import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { lazyAction } from "../../shared/lazyAction";
import { sessionIdHelp } from "./sessionIdHelp";

export function registerCloseRenameCommands(cmd: Command): void {
	internalCommand(
		cmd
			.command("close")
			.description(
				"Dismiss a daemon-managed session (the current one by default), ending it and reaping its worktree",
			)
			.option("--id <id>", sessionIdHelp)
			.action(lazyAction(() => import("./closeSession"), "closeSession")),
		"/close",
	);

	internalCommand(
		cmd
			.command("rename <title>")
			.description(
				"Retitle a daemon-managed session (the current one by default), overriding the generated title for the rest of its life",
			)
			.option("--id <id>", sessionIdHelp)
			.action(lazyAction(() => import("./renameSession"), "renameSession")),
		"/rename",
	);
}
