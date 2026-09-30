import { ghJson } from "../releases/ghJson";
import { peerPrsQuery } from "./peerPrsQuery";
import { selectPeerPrs } from "./selectPeerPrs";
import type { GhPeerPrNode, NextPr } from "./types";

type PeerPrsResponse = {
	data?: {
		viewer?: { login?: string } | null;
		repository?: {
			pullRequests?: { nodes?: (GhPeerPrNode | null)[] } | null;
		} | null;
	};
};

export async function fetchPeerPrs(
	cwd: string,
	peers: string[],
): Promise<NextPr[]> {
	const response = await ghJson<PeerPrsResponse>(cwd, [
		"api",
		"graphql",
		"-f",
		`query=${peerPrsQuery}`,
		"-F",
		"owner={owner}",
		"-F",
		"name={repo}",
	]);
	const viewer = response.data?.viewer?.login;
	const repository = response.data?.repository;
	if (!viewer || !repository) throw new Error("Repository not readable");
	const nodes = (repository.pullRequests?.nodes ?? []).filter(
		(node): node is GhPeerPrNode => !!node,
	);
	return selectPeerPrs(nodes, viewer, peers);
}
