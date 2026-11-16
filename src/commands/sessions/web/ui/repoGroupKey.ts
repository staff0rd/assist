import type { RepoGroup } from "../../shared/RepoGroup";

export type Grouped = { cwd?: string; repoGroup?: RepoGroup };

export function repoGroupKey(session: Grouped): string | undefined {
	return session.repoGroup?.origin || session.cwd || undefined;
}

export function repoGroupCwd(session: Grouped): string | undefined {
	return session.repoGroup?.clone || session.cwd || undefined;
}

export function repoKeyForCwd(cwd: string, grouped: Grouped[]): string {
	if (!cwd) return cwd;
	for (const session of grouped) {
		const group = session.repoGroup;
		if (!group) continue;
		if (group.clone === cwd || session.cwd === cwd) return group.origin;
	}
	return cwd;
}
