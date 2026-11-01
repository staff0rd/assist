import type { Command } from "commander";
import { next } from "./next";
import { skip } from "./skip";
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
		.description("Add an ISO week (YYYY-Www) to the skip list")
		.action(skip);

	devlogCommand
		.command("write")
		.description(
			"Write a dev entry from JSON on stdin (week, title, versions, aiGenerated, added/changed/fixed, lede)",
		)
		.action(write);
}
