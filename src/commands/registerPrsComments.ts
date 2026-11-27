import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { registerPrsReviewReply } from "./registerPrsReviewReply";
import { registerPrsThreadReplies } from "./registerPrsThreadReplies";

const reviewComments = "/review-pr-comments";

export function registerPrsComments(prsCommand: Command): void {
	internalCommand(
		prsCommand
			.command("list-comments")
			.description("List all comments on the current branch's pull request")
			.action(async () => {
				const { listComments: prsListComments } =
					await import("./prs/listComments");
				const { printComments: prsPrintComments } =
					await import("./prs/listComments/printComments");
				prsListComments().then(prsPrintComments);
			}),
		reviewComments,
	);

	registerPrsThreadReplies(prsCommand, reviewComments);
	registerPrsReviewReply(prsCommand, reviewComments);

	internalCommand(
		prsCommand
			.command("comment <path> <line> <body>")
			.description(
				"Add a line comment to the pending review (body of - reads it from stdin)",
			)
			.action(async (path: string, line: string, body: string) => {
				const { comment: prsComment } = await import("./prs/comment");
				const { readBodyArgument } = await import("./prs/readBodyArgument");
				try {
					await prsComment(
						path,
						Number.parseInt(line, 10),
						await readBodyArgument(body),
					);
				} catch (error) {
					console.error(
						`Error: ${error instanceof Error ? error.message : String(error)}`,
					);
					process.exit(1);
				}
			}),
		"/comment and /forward-comments",
	);
}
