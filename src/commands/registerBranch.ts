import type { Command } from "commander";
import { branch } from "./branch/branch";

export function registerBranch(program: Command): void {
	program
		.command("branch <slug>")
		.description(
			"Create and switch to a branch off the fresh remote default branch",
		)
		.option("--jira <key>", "Jira issue key to include in the branch name")
		.addHelpText(
			"after",
			`
Branch name is assembled as [<prefix>/][<JIRA>-]<slug>, e.g. sw/BAD-671-add-login-form.

Config:
  assist config set branch.prefix sw          # optional; prepends "<prefix>/" (omitted when unset)
  assist config set branch.defaultBranch main # optional; overrides the live remote default branch`,
		)
		.action((slug: string, options: { jira?: string }) =>
			branch(slug, options),
		);
}
