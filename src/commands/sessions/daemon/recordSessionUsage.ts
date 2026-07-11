import type { ActiveWindow } from "../../../shared/activeWindows";
import type { Session } from "./createSession";
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
				windows,
			);
		return true;
	}
	return false;
}
