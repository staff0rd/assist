import { repoKeyForCwd } from "../../../../repoGroupKey";
import type { HistoricalSession } from "../../../../types";
import { uniqueRepos } from "./mergeRepos/uniqueRepos";

export const LOCAL_NODE = "";

export type MergedRepo = {
	key: string;
	origin?: string;
	clones: Record<string, string>;
};

function historyByNode(
	history: HistoricalSession[],
): Map<string, HistoricalSession[]> {
	const byNode = new Map<string, HistoricalSession[]>([[LOCAL_NODE, []]]);
	for (const session of history) {
		const node = session.node ?? LOCAL_NODE;
		byNode.set(node, [...(byNode.get(node) ?? []), session]);
	}
	return byNode;
}

export function mergeRepos(
	currentCwd: string,
	history: HistoricalSession[],
): MergedRepo[] {
	const byKey = new Map<string, MergedRepo>();
	for (const [node, sessions] of historyByNode(history)) {
		const nodeCwd = node === LOCAL_NODE ? currentCwd : "";
		for (const cwd of uniqueRepos(nodeCwd, sessions)) {
			const key = repoKeyForCwd(cwd, sessions);
			const repo = byKey.get(key) ?? {
				key,
				origin: key === cwd ? undefined : key,
				clones: {},
			};
			repo.clones[node] ??= cwd;
			byKey.set(key, repo);
		}
	}
	return [...byKey.values()];
}

export function preferredClone(repo: MergedRepo, node: string): string {
	return (
		repo.clones[node] ??
		repo.clones[LOCAL_NODE] ??
		Object.values(repo.clones)[0]
	);
}

export function findRepo(
	repos: MergedRepo[],
	cwd: string,
): MergedRepo | undefined {
	return repos.find((repo) => Object.values(repo.clones).includes(cwd));
}
