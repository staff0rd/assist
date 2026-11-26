import { isDoNotMerge } from "../../../prs/status/isDoNotMerge";
import { meetsApprovalBar } from "./meetsApprovalBar";
import { resolveRepoRule } from "./resolveRepoRule";
import { sameLogin } from "./sameLogin";
import { toNextPr } from "./toNextPr";
import type { GhPeerPrNode, NextRepoRules, RepolessPr } from "./types";

function isRequested(node: GhPeerPrNode, viewer: string): boolean {
	return (node.reviewRequests?.nodes ?? []).some((request) =>
		sameLogin(request?.requestedReviewer?.login, viewer),
	);
}

function isApproved(node: GhPeerPrNode): boolean {
	return (node.latestReviews?.nodes ?? []).some(
		(review) => review?.state === "APPROVED",
	);
}

function requestedChanges(node: GhPeerPrNode, viewer: string): boolean {
	return (node.latestReviews?.nodes ?? []).some(
		(review) =>
			review?.state === "CHANGES_REQUESTED" &&
			sameLogin(review.author?.login, viewer),
	);
}

export function selectPeerPrs(
	nodes: GhPeerPrNode[],
	viewer: string,
	peers: string[],
	rules: NextRepoRules = {},
	repoOf: (pr: { url: string }) => string = () => "",
): RepolessPr[] {
	const selected: RepolessPr[] = [];
	for (const node of nodes) {
		const author = node.author?.login ?? "unknown";
		if (node.isDraft || isDoNotMerge(node.title) || sameLogin(author, viewer))
			continue;
		const requested = isRequested(node, viewer);
		const byPeer = peers.some((peer) => sameLogin(author, peer));
		if (
			!requested &&
			(!byPeer || isApproved(node) || requestedChanges(node, viewer))
		)
			continue;
		if (meetsApprovalBar(node, viewer, resolveRepoRule(rules, repoOf(node))))
			continue;
		selected.push(toNextPr(node, author, requested, viewer));
	}
	return selected.sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
}
