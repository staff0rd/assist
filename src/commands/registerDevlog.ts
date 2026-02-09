import type { Command } from "commander";
import {
	list as devlogList,
	next as devlogNext,
	skip as devlogSkip,
	version as devlogVersion,
} from "./devlog";

export function registerDevlog(program: Command): void {
	const devlogCommand = program
		.command("devlog")
		.description("Development log utilities");

	devlogCommand
		.command("list")
		.description("Group git commits by date")
		.option(
			"--days <number>",
			"Number of days to show (default: 30)",
			Number.parseInt,
		)
		.option("--since <date>", "Only show commits since this date (YYYY-MM-DD)")
		.option("-r, --reverse", "Show earliest commits first")
		.option("-v, --verbose", "Show file names for each commit")
		.action(devlogList);

	devlogCommand
		.command("version")
		.description("Show current repo name and version info")
		.action(devlogVersion);

	devlogCommand
		.command("next")
		.description("Show commits for the day after the last versioned entry")
		.option("-v, --verbose", "Show file names for each commit")
		.action(devlogNext);

	devlogCommand
		.command("skip <date>")
		.description("Add a date (YYYY-MM-DD) to the skip list")
		.action(devlogSkip);
}
