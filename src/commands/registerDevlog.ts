import type { Command } from "commander";
import {
	list as devlogList,
	next as devlogNext,
	repos as devlogRepos,
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

	devlogCommand
		.command("repos")
		.description("Show repos missing devlog entries")
		.option(
			"--days <number>",
			"Only show repos pushed within N days (default: 30)",
			Number.parseInt,
		)
		.option("--all", "Show all non-archived repos regardless of push date")
		.action(devlogRepos);
}
