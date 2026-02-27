import type { Command } from "commander";
import { cliDiscover } from "./cliDiscover";

export function registerCliDiscover(program: Command): void {
	program
		.command("cli-discover")
		.description("Discover a CLI's command tree via recursive --help parsing")
		.argument(
			"<cli...>",
			"CLI binary and optional subcommand (e.g. gh, az, acli jira)",
		)
		.option("--no-cache", "Force fresh discovery, ignoring cached results")
		.action((cli: string[], options: { cache: boolean }) => {
			cliDiscover(cli.join(" "), { noCache: !options.cache });
		});
}
