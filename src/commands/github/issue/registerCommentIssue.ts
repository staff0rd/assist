import type { Command } from "commander";
import { collect } from "../../prs/collect";
import { minGhAttachVersion } from "../../prs/minGhAttachVersion";
import { internalCommand } from "../../../shared/internalCommand";

export function registerCommentIssue(issueCommand: Command): void {
	const commentCommand = issueCommand
		.command("comment <number>")
		.description("Comment on a GitHub issue (body of - reads it from stdin)")
		.option("--body <body>", "Comment body (- reads it from stdin)")
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.option(
			"--screenshot <spec>",
			"Attach an image or video as '[Group/]Caption=path' under ## Screenshots (repeatable)",
			collect,
			[],
		)
		.addHelpText(
			"after",
			`\nThe comment is outward-facing: write it for the repo's readers, not the team. It is rejected if it references Claude or an assist backlog item.\nIn an assist web session the body is previewed for approve/reject first (with inline comments); nothing is posted until it is approved.\nWhen you already have an image or video to include (e.g. a file the user pointed at), pass it with --screenshot '[Group/]Caption=path' (once per file) rather than asking the reviewer to drop it in; a missing file or an extension gh cannot attach fails before anything is previewed. In a web session it arrives pre-staged in the preview, and the reviewer may also drop or paste more screenshots or video into the pane; on approval gh attaches them all (gh ${minGhAttachVersion}+) under a ## Screenshots section of the comment. Outside a web session the --screenshot files are attached directly. Never author a ## Screenshots section yourself.`,
		)
		.action(
			async (
				number: string,
				options: { body?: string; repo?: string; screenshot?: string[] },
			) => {
				const { readBodyArgument } = await import("../../prs/readBodyArgument");
				const { commentIssue } = await import("./commentIssue");
				await commentIssue(number, {
					...options,
					body: options.body ? await readBodyArgument(options.body) : undefined,
				});
			},
		);
	internalCommand(commentCommand, "/github update");
}
