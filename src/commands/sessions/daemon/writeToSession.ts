import { removeActivity } from "../../../shared/emitActivity";
import { releaseLock } from "../../backlog/acquireLock";
import { clearPause, requestPause } from "../../backlog/consumePause";
import type { Session } from "./createSession";

export function writeToSession(
	sessions: Map<string, Session>,
	id: string,
	data: string,
): void {
	const s = sessions.get(id);
	if (s && s.status !== "done") s.pty?.write(data);
}

export function resizeSession(
	sessions: Map<string, Session>,
	id: string,
	cols: number,
	rows: number,
): void {
	const s = sessions.get(id);
	if (s && s.status !== "done") s.pty?.resize(cols, rows);
}

export function setAutoRun(
	sessions: Map<string, Session>,
	id: string,
	enabled: boolean,
): boolean {
	const s = sessions.get(id);
	if (!s) return false;
	s.autoRun = enabled;
	return true;
}

export function setAutoAdvance(
	sessions: Map<string, Session>,
	id: string,
	enabled: boolean,
): boolean {
	const s = sessions.get(id);
	if (!s) return false;
	s.autoAdvance = enabled;
	const itemId = s.activity?.itemId;
	if (itemId != null) {
		if (enabled) clearPause(itemId);
		else requestPause(itemId);
	}
	return true;
}

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
	return true;
}
