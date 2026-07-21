import type { ActiveWindow } from "../../../shared/activeWindows";
import type { Session } from "./createSession";
import { recordSessionUsage } from "./recordSessionUsage";

export function applyUsageRecord(
	sessions: Iterable<Session>,
	windows: ActiveWindow[],
	notify: () => void,
	claudeSessionId: string,
	transcriptPath: string | undefined,
	usedPct: number | undefined,
): void {
	if (
		recordSessionUsage(
			sessions,
			claudeSessionId,
			transcriptPath,
			usedPct,
			windows,
		)
	)
		notify();
}
