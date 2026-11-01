import type { Session } from "./createSession";
import { flushPhaseActiveMs } from "./flushPhaseActiveMs";

export async function flushAllPhaseActiveMs(
	sessions: Map<string, Session>,
): Promise<void> {
	await Promise.all([...sessions.values()].map((s) => flushPhaseActiveMs(s)));
}
