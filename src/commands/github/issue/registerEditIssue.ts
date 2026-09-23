import type { Command } from "commander";
import { editIssue } from "./editIssue";

export function registerEditIssue(issueCommand: Command): void {
	issueCommand
		.command("edit <number>")
		.description("Edit an existing GitHub issue's body in the preview pane")
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.option(
			"--fresh",
			"Discard any working file for the issue and re-fetch its body from GitHub",
		)
		.option(
			"--parent <issue>",
			"Make the issue a sub-issue of this one, as owner/repo#number, a github.com issue URL, or a bare number",
		)
		.addHelpText(
			"after",
			"\nFetches the issue's current body and opens it in the assist web preview pane, where it can be reworked before it is pushed back. Approving pushes the pane's markdown to the issue; nothing is pushed if the issue moved on GitHub after it was fetched, or outside a web session.\nRejecting writes the pane's markdown to a working file and names it: revise that file in place and re-run to preview the revision, which keeps any collapses already applied. A re-run resumes from the working file while the issue has not moved on GitHub; --fresh discards it and re-fetches.\nOnly the body is touched — the title, labels, assignees and state are left alone.\n--parent sets the issue's parent instead of editing the body: nothing is previewed and no web session is needed. A bare number is read against --repo, or the current repo; a parent in another repository is allowed.",
		)
		.action(editIssue);
}
