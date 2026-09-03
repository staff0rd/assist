import type { Command } from "commander";
import { readBodyArgument } from "../../prs/readBodyArgument";
import { editIssueComment } from "./editIssueComment";

export function registerEditIssueComment(issueCommand: Command): void {
	issueCommand
		.command("edit-comment <comment-id>")
		.description(
			"Replace the body of a posted GitHub issue comment (body of - reads it from stdin)",
		)
		.option("--body <body>", "Replacement comment body (- reads it from stdin)")
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.addHelpText(
			"after",
			"\nThe comment id is the numeric id from the comment's API url or the #issuecomment-<id> anchor on github.com, not the issue number.\nThe replacement is outward-facing: write it for the repo's readers, not the team. It is rejected if it references Claude or an assist backlog item.\nIn an assist web session the replacement is previewed for approve/reject first (with inline comments); the published comment is left alone until it is approved. The replacement is the whole body — what is there now is overwritten, so fetch it first if it should be built on.",
		)
		.action(
			async (commentId: string, options: { body?: string; repo?: string }) => {
				await editIssueComment(commentId, {
					...options,
					body: options.body ? await readBodyArgument(options.body) : undefined,
				});
			},
		);
}
