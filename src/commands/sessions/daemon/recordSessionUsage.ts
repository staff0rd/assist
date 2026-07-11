import type { ActiveWindow } from "../../../shared/activeWindows";
import type { Session } from "./createSession";
import { flushPhaseActiveMs } from "./flushPhaseActiveMs";
import { persistPhaseTokens } from "./persistPhaseTokens";
import { sessionBacklogPhase } from "./sessionBacklogPhase";

export function recordSessionUsage(
	sessions: Iterable<Session>,
	claudeSessionId: string,
	transcriptPath: string | undefined,
	usedPct: number | undefined,
	windows: ActiveWindow[],
): boolean {
	for (const session of sessions) {
		if (session.claudeSessionId !== claudeSessionId) continue;
		session.usedPct = usedPct;
		const phase = sessionBacklogPhase(session);
		if (phase && transcriptPath)
			void persistPhaseTokens(
				phase.itemId,
				phase.phaseIdx,
				transcriptPath,
				usedPct,
				windows,
			);
		void flushPhaseActiveMs(session);
		return true;
	}
	return false;
}
