import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";

export function registerPrsReviewReply(
	prsCommand: Command,
	calledBy: string,
): void {
	internalCommand(
		prsCommand
			.command("review-reply <review-id> <body>")
			.description(
				"Post one PR comment answering a review body and mark it handled (body of - reads it from stdin)",
			)
			.action(async (reviewId: string, body: string) => {
				const { readBodyArgument } = await import("./prs/readBodyArgument");
				const { reviewReply } = await import("./prs/reviewReply");
				await reviewReply(
					Number.parseInt(reviewId, 10),
					await readBodyArgument(body),
				);
			}),
		calledBy,
	);

	internalCommand(
		prsCommand
			.command("review-ack <review-id>")
			.description(
				"Mark a review handled locally without posting to the PR, for a review with nothing to act on",
			)
			.action(async (reviewId: string) => {
				const { reviewAck } = await import("./prs/reviewAck");
				reviewAck(Number.parseInt(reviewId, 10));
			}),
		calledBy,
	);
}
