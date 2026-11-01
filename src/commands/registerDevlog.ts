import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { devlogConfigHelp } from "./devlog/devlogConfigHelp";
import { list as devlogList } from "./devlog/list";
import { registerDevlogEntryCommands } from "./devlog/registerDevlogEntryCommands";
import { repos as devlogRepos } from "./devlog/repos";
import { version as devlogVersion } from "./devlog/version";

export function registerDevlog(program: Command): void {
	const devlogCommand = program
		.command("devlog")
		.description("Development log utilities");

	devlogCommand
		.command("list")
		.description("Group git commits by ISO week")
		.option(
			"--weeks <number>",
			"Number of weeks to show, including the current one (default: 6)",
			Number.parseInt,
		)
		.option(
			"--since <date|week>",
			"Only show commits since this date (YYYY-MM-DD) or week (YYYY-Www)",
		)
		.option("-r, --reverse", "Show earliest weeks first")
		.option("-v, --verbose", "Show file names for each commit")
		.action(devlogList);

	devlogCommand
		.command("version")
		.description("Show the repo name, its latest dev entry week and versions")
		.action(devlogVersion);

	registerDevlogEntryCommands(devlogCommand);

	devlogCommand
		.command("repos")
		.description("Show repos missing weekly dev entries")
		.option(
			"--days <number>",
			"Only show repos pushed within N days (default: 30)",
			Number.parseInt,
		)
		.option("--all", "Show all non-archived repos regardless of push date")
		.action(devlogRepos);

	configHelp(devlogCommand, devlogConfigHelp);
}
