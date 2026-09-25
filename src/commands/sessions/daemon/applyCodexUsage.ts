import type { ActiveWindow } from "../../../shared/activeWindows";
import type { readCodexRolloutUsage } from "../shared/codex/codexRolloutUsage";
import type { Session } from "./createSession";
import { flushPhaseActiveMs } from "./flushPhaseActiveMs";
import { persistPhaseTokens } from "./persistPhaseTokens";
import { sessionBacklogPhase } from "./sessionBacklogPhase";

type CodexUsage = Awaited<ReturnType<typeof readCodexRolloutUsage>>;

export function applyCodexUsage(
	sessions: Map<string, Session>,
	sessionId: string,
	usage: CodexUsage,
	windows: ActiveWindow[],
): boolean {
	const session = sessions.get(sessionId);
	if (!session) return false;
	if (usage.usedPct !== undefined) session.usedPct = usage.usedPct;
	const phase = sessionBacklogPhase(session);
	if (phase)
		void persistPhaseTokens(
			phase.itemId,
			phase.phaseIdx,
			async () => usage.responses,
			usage.usedPct,
			windows,
		);
	void flushPhaseActiveMs(session);
	return true;
}
