import type { Command } from "commander";
import { branch } from "./branch/branch";

export function registerBranch(program: Command): void {
	program
		.command("branch <slug>")
		.description(
			"Create and switch to a branch off the fresh remote default branch",
		)
		.option("--jira <key>", "Jira issue key to include in the branch name")
		.action((slug: string, options: { jira?: string }) =>
			branch(slug, options),
		);
}
