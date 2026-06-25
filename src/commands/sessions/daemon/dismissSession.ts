import { removeActivity } from "../../../shared/emitActivity";
import { releaseLock } from "../../backlog/acquireLock";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function dismissSession(
	sessions: Map<string, Session>,
	id: string,
): boolean {
	const s = sessions.get(id);
	if (!s) return false;
	if (s.status !== "done") s.pty?.kill();
	s.activityWatcher?.close();
	removeActivity(s.id);
	if (s.activity?.itemId != null) releaseLock(s.activity.itemId);
	sessions.delete(id);
	daemonLog(`session ${id} dismissed (${s.name})`);
	return true;
}

export function drainSessions(
	sessions: Map<string, Session>,
	onDrained: () => void,
): number {
	const names = [...sessions.values()].map((s) => s.name);
	const ids = [...sessions.keys()];
	for (const id of ids) dismissSession(sessions, id);
	onDrained();
	daemonLog(
		ids.length > 0
			? `drained ${ids.length} session(s): ${names.join(", ")}`
			: "drained 0 sessions",
	);
	return ids.length;
}
