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
}
