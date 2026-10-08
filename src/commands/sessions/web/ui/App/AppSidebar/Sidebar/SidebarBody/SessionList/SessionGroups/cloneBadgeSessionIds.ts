import type { RepoGroup } from "../../../../../../../../shared/RepoGroup";

type Badgeable = { id: string; cwd?: string; repoGroup?: RepoGroup };

export function cloneBadgeSessionIds(sessions: Badgeable[]): Set<string> {
	return new Set(
		sessions
			.filter((s) => s.cwd && s.cwd === s.repoGroup?.clone)
			.map((s) => s.id),
	);
}
