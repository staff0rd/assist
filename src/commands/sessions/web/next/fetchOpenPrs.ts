import { ghJson } from "../releases/ghJson";
import { fetchOwnerOpenPrs } from "./fetchOwnerOpenPrs";
import { isOwnerEntry } from "./isOwnerEntry";
import { peerPrsQuery } from "./peerPrsQuery";
import { splitOpenPrs } from "./splitOpenPrs";
import type { GhPeerPrNode, OpenPrs } from "./types";

type PeerPrsResponse = {
	data?: {
		viewer?: { login?: string } | null;
		repository?: {
			pullRequests?: { nodes?: (GhPeerPrNode | null)[] } | null;
		} | null;
	};
};

export async function fetchOpenPrs(
	cwd: string,
	repo: string,
	peers: string[],
): Promise<OpenPrs> {
	if (isOwnerEntry(repo)) return fetchOwnerOpenPrs(cwd, repo, peers);
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
	return splitOpenPrs(nodes, viewer, peers, () => repo);
}
