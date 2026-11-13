import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { lazyAction } from "../shared/lazyAction";

export function registerStatusLine(program: Command): void {
	internalCommand(
		program
			.command("status-line")
			.description("Format Claude Code status line from JSON stdin")
			.action(lazyAction(() => import("./statusLine"), "statusLine")),
		"Claude Code's status line",
	);
}
