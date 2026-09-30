import { ghJson } from "../releases/ghJson";
import { ownerPeerPrsQuery } from "./ownerPeerPrsQuery";
import { selectPeerPrs } from "./selectPeerPrs";
import type { GhPeerPrNode, NextPr } from "./types";

type SearchResult = { nodes?: (GhPeerPrNode | null)[] } | null;

type OwnerPeerPrsResponse = {
	data?: {
		viewer?: { login?: string } | null;
		requested?: SearchResult;
		authored?: SearchResult;
	};
};

function uniqueNodes(...results: (SearchResult | undefined)[]): GhPeerPrNode[] {
	const byUrl = new Map<string, GhPeerPrNode>();
	for (const node of results.flatMap((result) => result?.nodes ?? []))
		if (node?.url) byUrl.set(node.url, node);
	return [...byUrl.values()];
}

export async function fetchOwnerPeerPrs(
	cwd: string,
	owner: string,
	peers: string[],
): Promise<NextPr[]> {
	const base = `user:${owner} is:pr is:open archived:false`;
	const authors = peers.map((peer) => `author:${peer}`).join(" ");
	const response = await ghJson<OwnerPeerPrsResponse>(cwd, [
		"api",
		"graphql",
		"-f",
		`query=${ownerPeerPrsQuery}`,
		"-f",
		`requested=${base} review-requested:@me`,
		"-f",
		`authored=${base} ${authors}`,
		"-F",
		`hasPeers=${peers.length > 0}`,
	]);
	const viewer = response.data?.viewer?.login;
	if (!viewer || !response.data?.requested)
		throw new Error("Owner not searchable");
	const nodes = uniqueNodes(response.data.requested, response.data.authored);
	const repoOf = new Map(
		nodes.map((node) => [node.url, node.repository?.nameWithOwner ?? owner]),
	);
	return selectPeerPrs(nodes, viewer, peers).map((pr) => ({
		...pr,
		repo: repoOf.get(pr.url) ?? owner,
	}));
}
