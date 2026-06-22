import type { Command } from "commander";
import { exportBacklog } from "./export";

export function registerExportCommand(cmd: Command): void {
	cmd
		.command("export [file]")
		.description(
			"Export every table in the backlog database (discovered by introspection) to a file, or stdout if omitted",
		)
		.action(exportBacklog);
}
