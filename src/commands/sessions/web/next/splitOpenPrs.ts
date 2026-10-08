import { selectMyPrs } from "./selectMyPrs";
import { selectPeerPrs } from "./selectPeerPrs";
import type { GhPeerPrNode, OpenPrs, RepolessPr } from "./types";

export function splitOpenPrs(
	nodes: GhPeerPrNode[],
	viewer: string,
	peers: string[],
	repoOf: (pr: RepolessPr) => string,
): OpenPrs {
	const withRepo = (prs: RepolessPr[]) =>
		prs.map((pr) => ({ ...pr, repo: repoOf(pr) }));
	return {
		peerPrs: withRepo(selectPeerPrs(nodes, viewer, peers)),
		myPrs: withRepo(selectMyPrs(nodes, viewer)),
	};
}
