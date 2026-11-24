import type { Command } from "commander";
import { collect } from "../../prs/collect";
import { minGhAttachVersion } from "../../prs/minGhAttachVersion";
import { internalCommand } from "../../../shared/internalCommand";
import { lazyAction } from "../../../shared/lazyAction";

export function registerEditIssue(issueCommand: Command): void {
	const editCommand = issueCommand
		.command("edit <number>")
		.description(
			"Edit an existing GitHub issue's body, title, parent or type in the preview pane",
		)
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.option(
			"--body <body>",
			"Proposed replacement body to preview instead of the current one (- reads it from stdin)",
		)
		.option(
			"--title <title>",
			"Rename the issue; previewed in the pane's header as old → new, with the body, before it is pushed",
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
			"Make the issue a sub-issue of this one, as owner/repo#number, a github.com issue URL, or a bare number; previewed with any title, body and type change",
		)
		.option(
			"--type <name>",
			"Change the issue's type to one of the organisation's issue types (e.g. Story); previewed with any title, body and parent change",
		)
		.option(
			"--screenshot <spec>",
			"Attach an image or video as '[Group/]Caption=path' under ## Screenshots (repeatable)",
			collect,
			[],
		)
		.addHelpText(
			"after",
			`\nFetches the issue's current body and opens it in the assist web preview pane, where it can be reworked before it is pushed back.\nWhen you already know the body you want, pass it with --body (--body - reads stdin): the first preview then shows that proposal instead of the current body, replacing any working file.\nTo make a targeted change to the current body (strike items out, tick a box), run with --fetch first: it writes the current body to the working file and prints its path without opening a preview. Edit that file in place, then re-run without --fetch or --body so the first preview shows your revision. Never run without --fetch just to get the body.\nApproving pushes the pane's markdown to the issue; nothing is pushed if the issue moved on GitHub after it was fetched, or outside a web session unless --title, --parent, --type or --screenshot is given.\nRejecting writes the pane's markdown to a working file and names it: revise that file in place and re-run to preview the revision, which keeps any collapses already applied. A re-run resumes from the working file while the issue has not moved on GitHub; --fresh discards it and re-fetches.\nTo rename the issue, pass --title <title>: the pane's header shows the change as old title → new title above the current body (or --body), and approving pushes the title, plus the body when it changed, in one gh issue edit. Outside a web session --title, --parent and --type are applied directly, with --body and --screenshot when given. --fetch cannot be combined with --title, --parent or --type.\nOnly the body, title, parent and type are touched — labels, assignees and state are left alone.\n--parent and --type set the issue's parent and type, alone or together with --title and --body, in one preview: both are resolved before anything is previewed (an unknown type fails listing the organisation's types), the pane shows them as Type and Parent old → new rows above the body, and one approval pushes the title, body, type and parent together. A bare --parent number is read against --repo, or the current repo; a parent in another repository is allowed. --type matches the organisation's issue type names, ignoring case.\nWhen you already have an image or video to add (e.g. a file the user pointed at), pass it with --screenshot '[Group/]Caption=path' (once per file) rather than asking the reviewer to drop it in; a missing file or an extension gh cannot attach fails before anything is previewed. In a web session it arrives pre-staged beside the editable body, and the reviewer may also drop or paste more screenshots or video into the pane; on approval gh attaches them all (gh ${minGhAttachVersion}+) under the body's ## Screenshots section, after any images already there. Outside a web session the --screenshot files are attached directly to the current body (or --body). Never author a ## Screenshots section yourself.`,
		)
		.action(lazyAction(() => import("./editIssue"), "editIssue"));
	internalCommand(editCommand, "/github");
}
