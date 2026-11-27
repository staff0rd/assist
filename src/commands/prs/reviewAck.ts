import { azureDevopsRemote } from "../review/azureDevopsRemote";
import { fetchReview } from "./fetchReview";
import { markReviewHandledLocally } from "./markReviewHandledLocally";
import { getCurrentPrNumber, getRepoInfo, isGhNotInstalled } from "./shared";

function fail(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

export function reviewAck(reviewId: number): void {
	if (!Number.isInteger(reviewId) || reviewId < 1)
		fail("review id must be a positive integer.");
	if (azureDevopsRemote(process.cwd()))
		fail("review-ack is GitHub only; Azure DevOps has no review bodies.");

	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();
		fetchReview(`repos/${org}/${repo}/pulls/${prNumber}/reviews`, reviewId);
		markReviewHandledLocally(org, repo, prNumber, reviewId);
		console.log(
			`Marked review #${reviewId} handled locally; nothing was posted to the PR.`,
		);
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
