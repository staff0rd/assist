import { existsSync } from "node:fs";
import { activityPath, reconcileActivity } from "../../../shared/emitActivity";
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
	const activity = await loadProvisionalRunActivity(itemId);
	if (!activity || sessions.get(session.id) !== session) return;
	if (session.activity || existsSync(activityPath(session.id))) return;
	session.activity = { ...activity, startedAt: Date.now() };
	reconcileActivity(session.id, session.activity);
	daemonLog(
		`session ${session.id} seeded provisional activity for item ${itemId} phase ${activity.phase}/${activity.totalPhases}`,
	);
	notify();
}
