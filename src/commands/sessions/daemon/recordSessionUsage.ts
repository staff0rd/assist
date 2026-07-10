import type { Session } from "./createSession";
import { persistPhaseTokens } from "./persistPhaseTokens";
import { sessionBacklogPhase } from "./sessionBacklogPhase";

/**
 * Accumulate the status line's token totals against the backlog phase of the
 * session that owns `claudeSessionId`. Does nothing when no session matches or
 * the matching session isn't on a backlog phase.
 */
export function recordSessionUsage(
	sessions: Iterable<Session>,
	claudeSessionId: string,
	totalIn: number,
	totalOut: number,
): boolean {
	for (const session of sessions) {
		if (session.claudeSessionId !== claudeSessionId) continue;
		session.totalIn = totalIn;
		session.totalOut = totalOut;
		const phase = sessionBacklogPhase(session);
		if (phase)
			void persistPhaseTokens(phase.itemId, phase.phaseIdx, totalIn, totalOut);
		return true;
	}
	return false;
}
