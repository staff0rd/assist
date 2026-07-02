import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { loadPhaseActiveMs } from "./loadPhaseActiveMs";
import { sessionBacklogPhase } from "./sessionBacklogPhase";

export async function seedRunningMsFromUsage(
	session: Session,
	notify: () => void,
): Promise<void> {
	if (session.usageSeeded) return;
	const phase = sessionBacklogPhase(session);
	if (!phase) return;
	session.usageSeeded = true;
	const priorMs = await loadPhaseActiveMs(phase.itemId, phase.phaseIdx);
	if (priorMs == null || priorMs <= session.runningMs) return;
	session.runningMs = priorMs;
	daemonLog(
		`session ${session.id} seeded runningMs=${priorMs} from item ${phase.itemId} phase ${phase.phaseIdx} recorded usage`,
	);
	notify();
}
