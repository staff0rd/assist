import { sameLogin } from "./sameLogin";
import { toNextPr } from "./toNextPr";
import type { GhPeerPrNode, RepolessPr } from "./types";

export function selectMyPrs(
	nodes: GhPeerPrNode[],
	viewer: string,
): RepolessPr[] {
	return nodes
		.filter((node) => sameLogin(node.author?.login, viewer))
		.map((node) => toNextPr(node, node.author?.login ?? viewer, false, viewer))
		.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
