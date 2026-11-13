import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";

export function registerStatusLine(program: Command): void {
	internalCommand(
		program
			.command("status-line")
			.description("Format Claude Code status line from JSON stdin")
			.action(async () => {
				const { statusLine } = await import("./statusLine");
				await statusLine();
			}),
		"Claude Code's status line",
	);
}
