import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { branch } from "./branch/branch";

export function registerBranch(program: Command): void {
	const branchCommand = program
		.command("branch <slug>")
		.description(
			"Create and switch to a branch off the fresh remote default branch",
		)
		.option("--jira <key>", "Jira issue key to include in the branch name")
		.action((slug: string, options: { jira?: string }) =>
			branch(slug, options),
		);

	configHelp(
		branchCommand,
		[
			{
				key: "branch.prefix",
				setter: "assist config set branch.prefix sw",
				note: 'optional; prepends "<prefix>/" (omitted when unset)',
			},
			{
				key: "branch.defaultBranch",
				setter: "assist config set branch.defaultBranch main",
				note: "optional; overrides the live remote default branch",
			},
		],
		"Branch name is assembled as [<prefix>/][<JIRA>-]<slug>, e.g. sw/BAD-671-add-login-form.",
	);
}
