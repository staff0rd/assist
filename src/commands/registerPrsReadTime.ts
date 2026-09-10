import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { readTime as prsReadTime } from "./prs/index";
import { prsReadTimeConfigHelp } from "./prs/prsConfigHelp";

export function registerPrsReadTime(prsCommand: Command): void {
	const readTimeCommand = prsCommand
		.command("read-time <target>")
		.description(
			"Estimate how long a pull request description takes to read (target is a PR number, a GitHub PR URL, - for stdin, or a file path)",
		)
		.option(
			"--budget <duration>",
			"read-time budget the estimate is judged against, e.g. 45s, 1m30s, 2m (default 1m)",
		)
		.action(async (target: string, options: { budget?: string }) => {
			await prsReadTime(target, options);
		});

	configHelp(readTimeCommand, prsReadTimeConfigHelp);
}
