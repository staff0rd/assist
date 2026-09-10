import type { Command } from "commander";
import { readTime as prsReadTime } from "./prs/index";

export function registerPrsReadTime(prsCommand: Command): void {
	prsCommand
		.command("read-time <target>")
		.description(
			"Estimate how long a pull request description takes to read (target is a PR number, a GitHub PR URL, - for stdin, or a file path)",
		)
		.action(async (target: string) => {
			await prsReadTime(target);
		});
}
