import { repoGroupCwd, repoGroupKey } from "../../../repoGroupKey";
import { repoLabel } from "../../repoLabel";
import { groupOrderStore } from "./groupOrderStore";
import type { SessionInfo } from "../../../types";

type RepoBucket = {
	key: string;
	label: string;
	members: SessionInfo[];
};

export function bucketSessionsByRepoKey(sessions: SessionInfo[]): RepoBucket[] {
	const buckets = new Map<string, RepoBucket>();
	for (const session of sessions) {
		const key = repoGroupKey(session) ?? ` nogroup:${session.id}`;
		const existing = buckets.get(key);
		if (existing) {
			existing.members.push(session);
			continue;
		}
		buckets.set(key, {
			key,
			label: repoLabel(repoGroupCwd(session) ?? key),
			members: [session],
		});
	}
	const rank = groupOrderStore.rank([...buckets.keys()]);
	return [...buckets.values()].sort(
		(a, b) => (rank.get(a.key) ?? 0) - (rank.get(b.key) ?? 0),
	);
}
