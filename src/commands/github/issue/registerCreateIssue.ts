import type { Command } from "commander";
import { collectLabels } from "./collectLabels";
import { createIssue } from "./createIssue";

export function registerCreateIssue(issueCommand: Command): void {
	issueCommand
		.command("create")
		.description("Create a GitHub issue")
		.option("--title <title>", "Issue title")
		.option("--body <body>", "Issue body")
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.option(
			"--type <name>",
			"Native issue type to set on the new issue (e.g. Epic)",
		)
		.option(
			"--parent <issue>",
			"Parent issue to file the new issue under, as owner/repo#number, a github.com issue URL, or a bare number",
		)
		.option(
			"--project <number>",
			"Number of the repo owner's GitHub Project to add the new issue to",
		)
		.option(
			"--status <name>",
			"Status option to set on the project item (requires --project)",
		)
		.option(
			"--label <name>",
			"Label to apply (repeat the flag, or pass a comma-separated list)",
			collectLabels,
			[],
		)
		.addHelpText(
			"after",
			"\nThere is no What/Why/How template: an issue reports a problem, and the target repo's own issue template is unknowable from here. Write the body as the repo's maintainers would expect.\nIn an assist web session the title and body are previewed for approve/reject first (with inline comments); nothing is created until it is approved.\nThe reviewer may also drop or paste screenshots into the pane; on approval these are appended to the issue body under a ## Screenshots section automatically, and on rejection they are discarded — so never author that section yourself.\n--type, --parent, --project, --status and --label are all resolved before the preview, so an unknown name, an unreadable parent, a missing project scope or --status without --project creates nothing.\nA bare --parent number is read against --repo, or the current repo; a parent in another repository is allowed.\nThe project scope is needed for --project: gh auth refresh -h github.com -s project",
		)
		.action(createIssue);
}
