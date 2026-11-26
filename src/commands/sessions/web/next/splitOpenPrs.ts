import { selectMyPrs } from "./selectMyPrs";
import { selectPeerPrs } from "./selectPeerPrs";
import type { GhPeerPrNode, NextRepoRules, OpenPrs, RepolessPr } from "./types";

export function splitOpenPrs(
	nodes: GhPeerPrNode[],
	viewer: string,
	peers: string[],
	repoOf: (pr: { url: string }) => string,
	rules: NextRepoRules,
): OpenPrs {
	const withRepo = (prs: RepolessPr[]) =>
		prs.map((pr) => ({ ...pr, repo: repoOf(pr) }));
	return {
		peerPrs: withRepo(selectPeerPrs(nodes, viewer, peers, rules, repoOf)),
		myPrs: withRepo(selectMyPrs(nodes, viewer)),
	};
}
