import type { HistoricalSession } from "../types";

type Repo = { key: string; clones: Record<string, string> };

function repoName(cwd: string): string {
	return cwd.split(/[\\/]/).filter(Boolean).pop() ?? cwd;
}

function knownLocalCwds(
	byKey: Map<string, Repo>,
	localHistory: HistoricalSession[],
	localNode: string,
): Set<string> {
	const known = new Set<string>();
	for (const s of localHistory) {
		if (s.cwd) known.add(s.cwd);
		if (s.repoGroup?.clone) known.add(s.repoGroup.clone);
	}
	for (const repo of byKey.values()) {
		const clone = repo.clones[localNode];
		if (clone) known.add(clone);
	}
	return known;
}

export function appendCloneBaseRepos(
	byKey: Map<string, Repo>,
	localHistory: HistoricalSession[],
	cloneBaseRepos: string[],
	localNode: string,
): void {
	const known = knownLocalCwds(byKey, localHistory, localNode);
	const sorted = [...cloneBaseRepos].sort((a, b) =>
		repoName(a).localeCompare(repoName(b)),
	);
	for (const cwd of sorted) {
		if (known.has(cwd)) continue;
		known.add(cwd);
		const repo = byKey.get(cwd) ?? { key: cwd, clones: {} };
		repo.clones[localNode] = cwd;
		byKey.set(cwd, repo);
	}
}
