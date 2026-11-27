import type { LineComment, PrComment, ReviewComment } from "../types";
import { agentFooter } from "./agentFooter";
import { commentStyle } from "./commentStyle";
import { groupThreads } from "./groupThreads";
import { printReviews } from "./printReviews";
import { renderResolvedIndex } from "./renderResolvedIndex";
import { renderThreadBlock } from "./renderThreadBlock";
import { summarise } from "./summarise";

export type ListCommentsResult = {
	comments: PrComment[];
	cachePath: string | null;
};

export function printComments(result: ListCommentsResult): void {
	const { comments, cachePath } = result;
	if (comments.length === 0) {
		console.log("No comments found.");
		return;
	}
	const style = commentStyle();
	const threads = groupThreads(
		comments.filter((c): c is LineComment => c.type === "line"),
	);
	const unresolved = threads.filter((t) => !t.resolved);
	const resolved = threads.filter((t) => t.resolved);

	const reviewCounts = printReviews(
		comments.filter((c): c is ReviewComment => c.type === "review"),
		style,
	);
	if (unresolved.length > 0) {
		console.log(`${style.cyan(`Unresolved threads (${unresolved.length})`)}\n`);
		for (const thread of unresolved) {
			console.log(renderThreadBlock(thread, style));
		}
	}
	if (resolved.length > 0) {
		console.log(renderResolvedIndex(resolved, style));
	}
	console.log(
		summarise({
			unhandledReviews: reviewCounts.unhandled,
			handledReviews: reviewCounts.handled,
			unresolved,
			resolved,
		}),
	);
	if (style.agent) {
		console.log(agentFooter(unresolved.length, reviewCounts.unhandled));
		return;
	}
	if (cachePath) {
		console.log(`Saved to ${cachePath}`);
	}
}
