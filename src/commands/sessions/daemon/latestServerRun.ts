import type { Session } from "./createSession";
import { liveServerRun } from "./liveServerRun";

export function latestServerRun(
	sessions: Map<string, Session>,
	origin: string,
	group: string,
): Session | undefined {
	const live = liveServerRun(sessions, origin, group);
	if (live) return live;
	let latest: Session | undefined;
	for (const s of sessions.values()) {
		if (!s.server || s.serverOrigin !== origin || s.serverGroup !== group)
			continue;
		if (!latest || s.startedAt > latest.startedAt) latest = s;
	}
	return latest;
}
