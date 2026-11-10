import { writeActivityIfAbsent } from "../../../shared/emitActivity";
import { backlogRunItemId } from "../../backlog/backlogRunItemId";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { loadProvisionalRunActivity } from "./loadProvisionalRunActivity";

export async function seedBacklogRunActivity(
	sessions: Map<string, Session>,
	session: Session | undefined,
	notify: () => void,
): Promise<void> {
	const itemId = backlogRunItemId(session?.assistArgs);
	if (!session || itemId === undefined) return;
	try {
		const activity = await loadProvisionalRunActivity(itemId, session.cwd);
		if (!activity || sessions.get(session.id) !== session) return;
		if (session.activity) return;
		const provisional = { ...activity, startedAt: Date.now() };
		if (!writeActivityIfAbsent(session.id, provisional)) {
			daemonLog(
				`session ${session.id} provisional activity skipped: child already reported`,
			);
			return;
		}
		session.activity = provisional;
		daemonLog(
			`session ${session.id} seeded provisional activity for item ${itemId} phase ${activity.phase}/${activity.totalPhases}`,
		);
		notify();
	} catch (error) {
		daemonLog(
			`session ${session.id} provisional activity failed: ${String(error)}`,
		);
	}
}
