import type { RepoGroup } from "../../../../../../../../../../../shared/RepoGroup";
import { repoGroupKey } from "../../../../../../../../../repoGroupKey";

type Badgeable = { id: string; cwd?: string; repoGroup?: RepoGroup };

export function cloneBadgeSessionIds(sessions: Badgeable[]): Set<string> {
	const byKey = new Map<string, Badgeable[]>();
	for (const session of sessions) {
		const key = repoGroupKey(session);
		if (!key) continue;
		const existing = byKey.get(key);
		if (existing) existing.push(session);
		else byKey.set(key, [session]);
	}
	const ids = new Set<string>();
	for (const group of byKey.values()) {
		const clones = group.filter((s) => s.cwd && s.cwd === s.repoGroup?.clone);
		if (clones.length === group.length) continue;
		for (const session of clones) ids.add(session.id);
	}
	return ids;
}
