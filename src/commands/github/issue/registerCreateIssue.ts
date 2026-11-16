import type { Command } from "commander";
import { collect } from "../../prs/collect";
import { minGhAttachVersion } from "../../prs/minGhAttachVersion";
import { collectLabels } from "./collectLabels";
import { internalCommand } from "../../../shared/internalCommand";
import { lazyAction } from "../../../shared/lazyAction";

export function registerCreateIssue(issueCommand: Command): void {
	const createCommand = issueCommand
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
		.option(
			"--milestone <name>",
			"Open milestone of the target repo to put the new issue on, by title",
		)
		.option(
			"--screenshot <spec>",
			"Attach an image or video as '[Group/]Caption=path' under ## Screenshots (repeatable)",
			collect,
			[],
		)
		.addHelpText(
			"after",
			`\nThere is no What/Why/How template: an issue reports a problem, and the target repo's own issue template is unknowable from here. Write the body as the repo's maintainers would expect.\nIn an assist web session the title and body are previewed for approve/reject first (with inline comments); nothing is created until it is approved.\nWhen you already have an image or video to include (e.g. a file the user pointed at), pass it with --screenshot '[Group/]Caption=path' (once per file) rather than asking the reviewer to drop it in; a missing file or an extension gh cannot attach fails before anything is previewed. In a web session it arrives pre-staged in the preview, and the reviewer may also drop or paste more screenshots or video into the pane; on approval gh attaches them all (gh ${minGhAttachVersion}+) under a ## Screenshots section of the issue body automatically, and on rejection the reviewer's stay attached and reappear in the preview you re-propose. Outside a web session the --screenshot files are attached directly. Never author a ## Screenshots section yourself.\n--type, --parent, --project, --status, --label and --milestone are all resolved before the preview, so an unknown name, an unreadable parent, a missing project scope or --status without --project creates nothing.\nA bare --parent number is read against --repo, or the current repo; a parent in another repository is allowed.\nThe project scope is needed for --project: gh auth refresh -h github.com -s project`,
		)
		.action(lazyAction(() => import("./createIssue"), "createIssue"));
	internalCommand(createCommand, "/github create");
}
