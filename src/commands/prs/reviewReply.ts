import { loadConfig } from "../../shared/loadConfig";
import { pushCommit } from "../commit/pushCommit";
import { azureDevopsRemote } from "../review/azureDevopsRemote";
import { buildReviewReplyBody } from "./buildReviewReplyBody";
import { rejectHarnessNames } from "./rejectHarnessNames";
import { reviewProposedPrComment } from "./reviewProposedPrComment";
import { getCurrentPrNumber, getRepoInfo, isGhNotInstalled } from "./shared";
import { validateShaReferences } from "./validateShaReferences";
import { fetchReview } from "./fetchReview";
import { postIssueComment } from "./postIssueComment";

function fail(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

export async function reviewReply(
	reviewId: number,
	body: string,
): Promise<void> {
	if (!Number.isInteger(reviewId) || reviewId < 1)
		fail("review id must be a positive integer.");
	if (azureDevopsRemote(process.cwd()))
		fail("review-reply is GitHub only; Azure DevOps has no review bodies.");
	if (!body.trim()) fail("Body must not be empty.");
	rejectHarnessNames("Body", body);
	validateShaReferences(body);

	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();
		const review = fetchReview(
			`repos/${org}/${repo}/pulls/${prNumber}/reviews`,
			reviewId,
		);
		const fullBody = buildReviewReplyBody(review, body);

		pushCommit(loadConfig().worktree?.trunk === true);
		await reviewProposedPrComment(
			`Reply to review #${reviewId}`,
			fullBody,
			prNumber,
		);
		const url = postIssueComment(
			`repos/${org}/${repo}/issues/${prNumber}/comments`,
			fullBody,
		);
		console.log(`Replied to review #${reviewId}: ${url}`);
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
