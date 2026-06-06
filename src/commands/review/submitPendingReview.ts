import { runGhGraphql } from "../../shared/runGhGraphql";
import { getCurrentPrNodeId, isGhNotInstalled } from "../prs/shared";

const MUTATION = `mutation($prId: ID!, $body: String) { submitPullRequestReview(input: { pullRequestId: $prId, event: COMMENT, body: $body }) { pullRequestReview { id } } }`;

export function submitPendingReview(body: string): void {
	try {
		const prId = getCurrentPrNodeId();
		runGhGraphql(MUTATION, { prId, body });
		console.log("Submitted pending review.");
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			return;
		}
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to submit review: ${message}`);
	}
}
