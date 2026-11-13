import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { internalCommand } from "../shared/internalCommand";
import { branchConfigHelp } from "./branch/branchConfigHelp";

export function registerBranch(program: Command): void {
	const branchCommand = program
		.command("branch <slug>")
		.description(
			"Create and switch to a branch off the fresh remote default branch",
		)
		.option("--jira <key>", "Jira issue key to include in the branch name")
		.option(
			"--from <ref>",
			"base the branch off <ref> verbatim (local branch, tag, or origin/*) instead of the fresh remote default",
		)
		.action(async (slug: string, options: { jira?: string; from?: string }) =>
			(await import("./branch/branch")).branch(slug, options),
		);

	internalCommand(branchCommand, "/branch");
	configHelp(
		branchCommand,
		branchConfigHelp,
		"Branch name is assembled as [<prefix>/][<JIRA>-]<slug>, e.g. sw/BAD-671-add-login-form.",
	);
}
