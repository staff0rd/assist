import { headCommit } from "./headCommit";
import { sameLogin } from "./sameLogin";
import { toNextPr } from "./toNextPr";
import type { GhPeerPrNode, RepolessPr } from "./types";

function isRequested(node: GhPeerPrNode, viewer: string): boolean {
	return (node.reviewRequests?.nodes ?? []).some((request) =>
		sameLogin(request?.requestedReviewer?.login, viewer),
	);
}

function approvedHead(node: GhPeerPrNode, viewer: string): boolean {
	const mine = (node.latestReviews?.nodes ?? []).find((review) =>
		sameLogin(review?.author?.login, viewer),
	);
	const headOid = headCommit(node)?.oid;
	return (
		mine?.state === "APPROVED" && !!headOid && mine.commit?.oid === headOid
	);
}

export function selectPeerPrs(
	nodes: GhPeerPrNode[],
	viewer: string,
	peers: string[],
): RepolessPr[] {
	const selected: RepolessPr[] = [];
	for (const node of nodes) {
		const author = node.author?.login ?? "unknown";
		if (node.isDraft || sameLogin(author, viewer)) continue;
		const requested = isRequested(node, viewer);
		const byPeer = peers.some((peer) => sameLogin(author, peer));
		if (!requested && (!byPeer || approvedHead(node, viewer))) continue;
		selected.push(toNextPr(node, author, requested, viewer));
	}
	return selected.sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
}
