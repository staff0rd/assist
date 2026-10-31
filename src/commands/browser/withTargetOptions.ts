import type { Command } from "commander";

export function withTargetOptions(command: Command): Command {
	return command
		.option(
			"--url <substring>",
			"Target the most recently active tab whose URL contains this, instead of the focused window's active tab",
		)
		.option(
			"--server <url>",
			"assist web server the extension connects to",
			"http://localhost:3100",
		);
}
