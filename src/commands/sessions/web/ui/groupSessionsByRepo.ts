import { repoLabel } from "./repoLabel";
import type { SessionInfo } from "./types";

type SessionGroup =
	| { kind: "single"; session: SessionInfo }
	| { kind: "repo"; key: string; label: string; sessions: SessionInfo[] };

export function groupSessionsByRepo(
	sessions: SessionInfo[],
	isStarred: (session: SessionInfo) => boolean,
): SessionGroup[] {
	const order: string[] = [];
	const buckets = new Map<string, SessionInfo[]>();

	sessions.forEach((session, index) => {
		const ungroupedKey = ` nogroup:${index}`;
		const key = session.cwd ?? ungroupedKey;
		const existing = buckets.get(key);
		if (existing) {
			existing.push(session);
		} else {
			order.push(key);
			buckets.set(key, [session]);
		}
	});

	const result: SessionGroup[] = [];
	for (const key of order) {
		const members = buckets.get(key)!;
		if (members.length < 2) {
			result.push({ kind: "single", session: members[0]! });
			continue;
		}
		const starredFirst = [
			...members.filter((s) => isStarred(s)),
			...members.filter((s) => !isStarred(s)),
		];
		result.push({
			kind: "repo",
			key,
			label: repoLabel(key),
			sessions: starredFirst,
		});
	}
	return result;
}
