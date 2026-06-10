import type { SessionInfo } from "./types";

// A reused card keeps its id but gets a fresh startedAt, so a changed
// startedAt for a known id means the pty was respawned (e.g. a draft card
// reused for `backlog run`) and the card should re-enter its loading state.
export function respawnedIds(
	prevStartedAt: Map<string, number>,
	next: SessionInfo[],
): string[] {
	const ids: string[] = [];
	for (const s of next) {
		const prev = prevStartedAt.get(s.id);
		if (prev !== undefined && prev !== s.startedAt) ids.push(s.id);
	}
	return ids;
}
