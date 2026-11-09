import { blockedBy } from "./blockedBy";
import type {
	AutoRestartSessions,
	AutoRestartSnapshot,
} from "./autoRestartBlocker";

type AutoRestartCheckDeps = {
	freshSessions: () => Promise<AutoRestartSessions | undefined>;
	attempted: { get: () => string | undefined };
};

export async function autoRestartPreflight(
	deps: AutoRestartCheckDeps,
	snap: AutoRestartSnapshot,
	activity: string | undefined,
	now: () => number,
): Promise<string | undefined> {
	const fresh = await deps.freshSessions();
	if (!fresh) return "daemon not reachable";
	return (
		blockedBy({ ...snap, ...fresh }, deps.attempted.get(), now()) ??
		(fresh.restartActivity !== activity
			? "session activity changed"
			: undefined)
	);
}
