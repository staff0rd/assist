import { ghJson } from "../releases/ghJson";
import { fetchOwnerPeerPrs } from "./fetchOwnerPeerPrs";
import { isOwnerEntry } from "./isOwnerEntry";
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
	repo: string,
	peers: string[],
): Promise<NextPr[]> {
	if (isOwnerEntry(repo)) return fetchOwnerPeerPrs(cwd, repo, peers);
	const [owner, name] = repo.split("/");
	const response = await ghJson<PeerPrsResponse>(cwd, [
		"api",
		"graphql",
		"-f",
		`query=${peerPrsQuery}`,
		"-F",
		`owner=${owner}`,
		"-F",
		`name=${name}`,
	]);
	const viewer = response.data?.viewer?.login;
	const repository = response.data?.repository;
	if (!viewer || !repository) throw new Error("Repository not readable");
	const nodes = (repository.pullRequests?.nodes ?? []).filter(
		(node): node is GhPeerPrNode => !!node,
	);
	return selectPeerPrs(nodes, viewer, peers).map((pr) => ({ ...pr, repo }));
}
