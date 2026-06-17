import { fetchItems } from "../../../backlog/web/ui/fetchItems";
import { sessionStarTarget, starTargetKey } from "./sessionStarTarget";
import type { SessionInfo } from "./types";

/** Distinct repo cwds among sessions that are building a backlog item. */
export function backlogCwds(sessions: SessionInfo[]): string[] {
	const set = new Set<string>();
	for (const session of sessions) {
		const target = sessionStarTarget(session);
		if (target) set.add(target.cwd);
	}
	return [...set].sort();
}

async function starredKeysForCwd(cwd: string): Promise<string[]> {
	try {
		const items = await fetchItems({ cwd, showCompleted: true });
		return items
			.filter((item) => item.starred)
			.map((item) => starTargetKey(cwd, item.id));
	} catch {
		// A repo whose backlog can't be read contributes no starred keys.
		return [];
	}
}

/** Starred-item keys (`cwd::id`) across the given repos. */
export async function loadStarredKeys(cwds: string[]): Promise<Set<string>> {
	const perCwd = await Promise.all(cwds.map(starredKeysForCwd));
	return new Set(perCwd.flat());
}
