import { headCommit } from "./headCommit";
import { sameLogin } from "./sameLogin";
import type { GhPeerPrNode, NextChecks, RepolessPr } from "./types";

const CHECK_STATES: Record<string, NextChecks> = {
	SUCCESS: "success",
	FAILURE: "failure",
	ERROR: "failure",
	PENDING: "pending",
	EXPECTED: "pending",
};

function lastRequestedAt(node: GhPeerPrNode, viewer: string): string {
	const events = (node.timelineItems?.nodes ?? []).filter((event) =>
		sameLogin(event?.requestedReviewer?.login, viewer),
	);
	return events.at(-1)?.createdAt ?? node.createdAt;
}

export function toNextPr(
	node: GhPeerPrNode,
	author: string,
	requested: boolean,
	viewer: string,
): RepolessPr {
	const rollup = headCommit(node)?.statusCheckRollup?.state;
	return {
		number: node.number,
		title: node.title,
		author,
		createdAt: node.createdAt,
		url: node.url,
		isDraft: node.isDraft,
		requestedAt: requested ? lastRequestedAt(node, viewer) : node.createdAt,
		reason: requested ? "requested" : "peer",
		checks: (rollup && CHECK_STATES[rollup]) || null,
	};
}
