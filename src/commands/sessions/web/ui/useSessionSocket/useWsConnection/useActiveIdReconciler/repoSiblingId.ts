import { repoGroupKey } from "../../../repoGroupKey";
import type { SessionInfo } from "../../../types";

export function repoSiblingId(
	sessions: SessionInfo[],
	previous: SessionInfo[],
	closedId: string,
): string | null {
	const closed = previous.find((s) => s.id === closedId);
	const key = closed && repoGroupKey(closed);
	if (!key) return null;
	const group = previous.filter((s) => repoGroupKey(s) === key);
	const index = group.findIndex((s) => s.id === closedId);
	const live = new Set(sessions.map((s) => s.id));
	const below = group.slice(index + 1).find((s) => live.has(s.id));
	const above = group
		.slice(0, index)
		.reverse()
		.find((s) => live.has(s.id));
	return (below ?? above)?.id ?? null;
}
