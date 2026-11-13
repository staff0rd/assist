import type { Command } from "commander";
import { internalCommand } from "../../../shared/internalCommand";
import { lazyAction } from "../../../shared/lazyAction";

export function registerEditIssue(issueCommand: Command): void {
	const editCommand = issueCommand
		.command("edit <number>")
		.description("Edit an existing GitHub issue's body in the preview pane")
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.option(
			"--body <body>",
			"Proposed replacement body to preview instead of the current one (- reads it from stdin)",
		)
		.option(
			"--fresh",
			"Discard any working file for the issue and re-fetch its body from GitHub",
		)
		.option(
			"--fetch",
			"Write the issue's current body to its working file and print the path, without previewing",
		)
		.option(
			"--parent <issue>",
			"Make the issue a sub-issue of this one, as owner/repo#number, a github.com issue URL, or a bare number",
		)
		.addHelpText(
			"after",
			"\nFetches the issue's current body and opens it in the assist web preview pane, where it can be reworked before it is pushed back.\nWhen you already know the body you want, pass it with --body (--body - reads stdin): the first preview then shows that proposal instead of the current body, replacing any working file.\nTo make a targeted change to the current body (strike items out, tick a box), run with --fetch first: it writes the current body to the working file and prints its path without opening a preview. Edit that file in place, then re-run without --fetch or --body so the first preview shows your revision. Never run without --fetch just to get the body.\nApproving pushes the pane's markdown to the issue; nothing is pushed if the issue moved on GitHub after it was fetched, or outside a web session.\nRejecting writes the pane's markdown to a working file and names it: revise that file in place and re-run to preview the revision, which keeps any collapses already applied. A re-run resumes from the working file while the issue has not moved on GitHub; --fresh discards it and re-fetches.\nOnly the body is touched — the title, labels, assignees and state are left alone.\n--parent sets the issue's parent instead of editing the body: nothing is previewed and no web session is needed. A bare number is read against --repo, or the current repo; a parent in another repository is allowed.",
		)
		.action(lazyAction(() => import("./editIssue"), "editIssue"));
	internalCommand(editCommand, "/github");
}
