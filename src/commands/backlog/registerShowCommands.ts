import type { Command } from "commander";
import { show as backlogShow } from "./show";

export function registerShowCommands(cmd: Command): void {
	cmd
		.command("show <id>")
		.alias("view")
		.description("Show full detail for a backlog item")
		.option(
			"--all-commits",
			"Show every commit in Activity instead of the newest 10",
		)
		.action(backlogShow);
}
