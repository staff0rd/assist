import { isDoNotMerge } from "../../../prs/status/isDoNotMerge";
import { sameLogin } from "./sameLogin";
import { toNextPr } from "./toNextPr";
import type { GhPeerPrNode, RepolessPr } from "./types";

function isRequested(node: GhPeerPrNode, viewer: string): boolean {
	return (node.reviewRequests?.nodes ?? []).some((request) =>
		sameLogin(request?.requestedReviewer?.login, viewer),
	);
}

function isApproved(node: GhPeerPrNode, viewer: string): boolean {
	const mine = (node.latestReviews?.nodes ?? []).find((review) =>
		sameLogin(review?.author?.login, viewer),
	);
	return mine?.state === "APPROVED";
}

export function selectPeerPrs(
	nodes: GhPeerPrNode[],
	viewer: string,
	peers: string[],
): RepolessPr[] {
	const selected: RepolessPr[] = [];
	for (const node of nodes) {
		const author = node.author?.login ?? "unknown";
		if (node.isDraft || isDoNotMerge(node.title) || sameLogin(author, viewer))
			continue;
		const requested = isRequested(node, viewer);
		const byPeer = peers.some((peer) => sameLogin(author, peer));
		if (!requested && (!byPeer || isApproved(node, viewer))) continue;
		selected.push(toNextPr(node, author, requested, viewer));
	}
	return selected.sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
}
