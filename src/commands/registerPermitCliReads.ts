import type { Command } from "commander";
import { permitCliReads } from "./permitCliReads";

export function registerPermitCliReads(program: Command): void {
	program
		.command("permit-cli-reads")
		.description("Discover a CLI's commands and auto-permit read-only ones")
		.argument(
			"<cli...>",
			"CLI binary and optional subcommand (e.g. gh, az, acli jira)",
		)
		.option("--no-cache", "Force fresh discovery, ignoring cached results")
		.action((cli: string[], options: { cache: boolean }) => {
			permitCliReads(cli.join(" "), { noCache: !options.cache });
		});
}
