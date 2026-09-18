import type { Command } from "commander";
import { startIssue } from "./startIssue";

export function registerStartIssue(issueCommand: Command): void {
	issueCommand
		.command("started <number>")
		.description(
			"Assign a GitHub issue to yourself and move its project boards to In Progress",
		)
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.addHelpText(
			"after",
			"\nThe boards are discovered from the issue itself: every ProjectV2 item the issue sits on whose Status field offers an In Progress option (matched case-insensitively) is moved.\nThe assignment is applied first and is never blocked by the board work — an issue on no board, a Status field with no In Progress option, and a gh token without the project scope are each reported and exit 0.\nThe project scope is needed to read or move a board: gh auth refresh -h github.com -s project",
		)
		.action(startIssue);
}
