import { ghJson } from "../releases/ghJson";
import { ownerOpenPrsQuery } from "./ownerOpenPrsQuery";
import { splitOpenPrs } from "./splitOpenPrs";
import type { GhPeerPrNode, OpenPrs } from "./types";

type SearchResult = { nodes?: (GhPeerPrNode | null)[] } | null;

type OwnerOpenPrsResponse = {
	data?: {
		viewer?: { login?: string } | null;
		requested?: SearchResult;
		authored?: SearchResult;
		mine?: SearchResult;
	};
};

function uniqueNodes(...results: (SearchResult | undefined)[]): GhPeerPrNode[] {
	const byUrl = new Map<string, GhPeerPrNode>();
	for (const node of results.flatMap((result) => result?.nodes ?? []))
		if (node?.url) byUrl.set(node.url, node);
	return [...byUrl.values()];
}

export async function fetchOwnerOpenPrs(
	cwd: string,
	owner: string,
	peers: string[],
): Promise<OpenPrs> {
	const base = `user:${owner} is:pr is:open archived:false`;
	const authors = peers.map((peer) => `author:${peer}`).join(" ");
	const response = await ghJson<OwnerOpenPrsResponse>(cwd, [
		"api",
		"graphql",
		"-f",
		`query=${ownerOpenPrsQuery}`,
		"-f",
		`requested=${base} review-requested:@me`,
		"-f",
		`authored=${base} ${authors}`,
		"-f",
		`mine=${base} author:@me`,
		"-F",
		`hasPeers=${peers.length > 0}`,
	]);
	const viewer = response.data?.viewer?.login;
	if (!viewer || !response.data?.requested)
		throw new Error("Owner not searchable");
	const { requested, authored, mine } = response.data;
	const nodes = uniqueNodes(requested, authored, mine);
	const repoOf = new Map(
		nodes.map((node) => [node.url, node.repository?.nameWithOwner ?? owner]),
	);
	return splitOpenPrs(
		nodes,
		viewer,
		peers,
		(pr) => repoOf.get(pr.url) ?? owner,
	);
}
