import type { Session } from "./createSession";
import { persistPhaseActiveMs } from "./persistPhaseActiveMs";
import { sessionBacklogPhase } from "./sessionBacklogPhase";

export function flushPhaseActiveMs(session: Session): Promise<void> {
	if (session.status !== "running" || session.runningSince == null)
		return Promise.resolve();
	const phase = sessionBacklogPhase(session);
	if (!phase) return Promise.resolve();
	const since = session.runningSince;
	const elapsed = Date.now() - since;
	const run = async (): Promise<void> => {
		const flushed =
			session.activeMsFlushedForStretch?.since === since
				? session.activeMsFlushedForStretch.ms
				: 0;
		const delta = elapsed - flushed;
		if (delta <= 0) return;
		if (await persistPhaseActiveMs(phase.itemId, phase.phaseIdx, delta))
			session.activeMsFlushedForStretch = { since, ms: flushed + delta };
	};
	const chain = (session.activeMsFlushChain ?? Promise.resolve()).then(run);
	session.activeMsFlushChain = chain;
	return chain;
}
