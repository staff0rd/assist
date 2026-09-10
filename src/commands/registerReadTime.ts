import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { readTime } from "./readTime/readTime";
import { readTimeConfigHelp } from "./readTime/readTimeConfigHelp";

export function registerReadTime(parent: Command): void {
	const readTimeCommand = parent
		.command("read-time <target>")
		.description(
			"Estimate how long a document takes to read (target is a pull request number, a GitHub pull request URL, - for stdin, or a file path)",
		)
		.option(
			"--budget <duration>",
			"read-time budget the estimate is judged against, e.g. 45s, 1m30s, 2m (default 1m)",
		)
		.action(async (target: string, options: { budget?: string }) => {
			await readTime(target, options);
		});

	configHelp(readTimeCommand, readTimeConfigHelp);
}
