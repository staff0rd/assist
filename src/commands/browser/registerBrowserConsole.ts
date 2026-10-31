import type { Command } from "commander";
import { CONSOLE_DEFAULT_LIMIT } from "../extension/consoleCapture/types";
import { parseTopCount } from "../github/parseTopCount";
import { browserConsole } from "./browserConsole";
import { parseSinceDuration } from "./parseSinceDuration";
import { withTargetOptions } from "./withTargetOptions";

export function registerBrowserConsole(browser: Command): void {
	withTargetOptions(
		browser
			.command("console")
			.description(
				"Print the target tab's recorded console warnings and errors, uncaught errors and unhandled rejections, oldest first. Recording is opt-in on the extension's options page",
			)
			.option("--all", "Print entries from every tab, not just the target tab")
			.option(
				"--since <duration>",
				"Only entries newer than this (e.g. 30s, 10m, 2h)",
				parseSinceDuration,
			)
			.option(
				"--grep <text>",
				"Only entries whose message, stack or URL contains this (case-insensitive)",
			)
			.option(
				"--limit <n>",
				"Print at most the newest n matching entries",
				parseTopCount,
				CONSOLE_DEFAULT_LIMIT,
			),
	).action(browserConsole);
}
