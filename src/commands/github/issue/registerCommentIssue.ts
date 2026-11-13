import type { Command } from "commander";
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
		.addHelpText(
			"after",
			"\nThe comment is outward-facing: write it for the repo's readers, not the team. It is rejected if it references Claude or an assist backlog item.\nIn an assist web session the body is previewed for approve/reject first (with inline comments); nothing is posted until it is approved.",
		)
		.action(
			async (number: string, options: { body?: string; repo?: string }) => {
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
