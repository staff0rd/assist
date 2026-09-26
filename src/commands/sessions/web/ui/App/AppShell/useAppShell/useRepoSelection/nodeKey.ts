import { LOCAL_NODE } from "./mergeRepos";

export function nodeKey(
	node: string | undefined,
	localNode: string | undefined,
): string {
	return !node || node === localNode ? LOCAL_NODE : node;
}
