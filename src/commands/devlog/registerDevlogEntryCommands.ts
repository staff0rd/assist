import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { next } from "./next";
import { posted } from "./posted/posted";
import { skip } from "./skip";
import { slack } from "./slack/slack";
import { write } from "./write";

export function registerDevlogEntryCommands(devlogCommand: Command): void {
	devlogCommand
		.command("next")
		.description(
			"Show commits for the next completed ISO week after the last dev entry",
		)
		.option("-v, --verbose", "Show file names for each commit")
		.action(next);

	devlogCommand
		.command("skip <week>")
		.description(
			"Add an ISO week (YYYY-Www) to this repo's repo (db) devlog.skipWeeks",
		)
		.action((week: string) => skip(week));

	internalCommand(
		devlogCommand
			.command("write")
			.description(
				"Write a dev entry from JSON on stdin (week, title, versions, aiGenerated, added/changed/fixed, lede)",
			)
			.action(write),
		"/devlog",
	);

	internalCommand(
		devlogCommand
			.command("slack [week]")
			.description(
				"List un-posted dev entries oldest first, or preview one week as a Slack parent message plus a threaded Added/Changed/Fixed reply, printing the channel and approved paths",
			)
			.action((week?: string) => slack(week)),
		"/devlog",
	);

	devlogCommand
		.command("posted <week> [permalink]")
		.description(
			"Record a dev entry's Slack permalink as slack: in its frontmatter, or slack: skipped with --skip",
		)
		.option("--skip", "Mark the entry as not to be posted")
		.action(
			(
				week: string,
				permalink: string | undefined,
				options: { skip?: boolean },
			) => posted(week, permalink, options),
		);
}
