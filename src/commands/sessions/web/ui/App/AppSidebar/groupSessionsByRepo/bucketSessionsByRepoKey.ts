import { repoGroupCwd, repoGroupKey } from "../../../repoGroupKey";
import { repoLabel } from "../../repoLabel";
import type { SessionInfo } from "../../../types";

type RepoBucket = {
	key: string;
	label: string;
	members: SessionInfo[];
};

export function bucketSessionsByRepoKey(sessions: SessionInfo[]): RepoBucket[] {
	const buckets = new Map<string, RepoBucket>();
	sessions.forEach((session, index) => {
		const key = repoGroupKey(session) ?? ` nogroup:${index}`;
		const existing = buckets.get(key);
		if (existing) {
			existing.members.push(session);
			return;
		}
		buckets.set(key, {
			key,
			label: repoLabel(repoGroupCwd(session) ?? key),
			members: [session],
		});
	});
	return [...buckets.values()];
}
