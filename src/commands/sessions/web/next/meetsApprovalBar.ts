import { sameLogin } from "./sameLogin";
import type { GhPeerPrNode, NextRepoRule } from "./types";

export function meetsApprovalBar(
	node: GhPeerPrNode,
	viewer: string,
	rule: NextRepoRule | undefined,
): boolean {
	const bar = rule?.hideReviewAfterApprovals;
	if (!bar) return false;
	const approvals = (node.latestReviews?.nodes ?? []).filter(
		(review) =>
			review?.state === "APPROVED" && !sameLogin(review.author?.login, viewer),
	).length;
	return approvals >= bar;
}
