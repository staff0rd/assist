import { repoKeyForCwd } from "./repoGroupKey";
import type { HistoricalSession } from "./types";
import { appendCloneBaseRepos } from "./mergeRepos/appendCloneBaseRepos";
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
	cloneBaseRepos: string[] = [],
): MergedRepo[] {
	const byKey = new Map<string, MergedRepo>();
	const byNode = historyByNode(history);
	for (const [node, sessions] of byNode) {
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
	appendCloneBaseRepos(
		byKey,
		byNode.get(LOCAL_NODE) ?? [],
		cloneBaseRepos,
		LOCAL_NODE,
	);
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
