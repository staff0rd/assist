import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { lazyAction } from "../../shared/lazyAction";

export function registerDevlogEntryCommands(devlogCommand: Command): void {
	devlogCommand
		.command("next")
		.description(
			"Show commits for the next completed ISO week after the last dev entry",
		)
		.option("-v, --verbose", "Show file names for each commit")
		.action(lazyAction(() => import("./next"), "next"));

	devlogCommand
		.command("skip <week>")
		.description(
			"Add an ISO week (YYYY-Www) to this repo's repo (db) devlog.skipWeeks",
		)
		.action(async (week: string) => (await import("./skip")).skip(week));

	internalCommand(
		devlogCommand
			.command("write")
			.description(
				"Write a dev entry from JSON on stdin (week, title, versions, aiGenerated, added/changed/fixed, lede)",
			)
			.action(lazyAction(() => import("./write"), "write")),
		"/devlog",
	);

	internalCommand(
		devlogCommand
			.command("slack [week]")
			.description(
				"List un-posted dev entries oldest first, or preview one week as a Slack parent message plus a threaded Added/Changed/Fixed reply, printing the channel and approved paths",
			)
			.action(async (week?: string) =>
				(await import("./slack/slack")).slack(week),
			),
		"/devlog",
	);

	devlogCommand
		.command("posted <week> [permalink]")
		.description(
			"Record a dev entry's Slack permalink as slack: in its frontmatter, or slack: skipped with --skip",
		)
		.option("--skip", "Mark the entry as not to be posted")
		.action(
			async (
				week: string,
				permalink: string | undefined,
				options: { skip?: boolean },
			) => (await import("./posted/posted")).posted(week, permalink, options),
		);
}
