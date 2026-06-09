import { removeActivity } from "../../../shared/emitActivity";
import type { Session } from "./createSession";
import { clearIdle } from "./scheduleIdle";

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
	if (s && s.status !== "done") {
		s.lastResizeAt = Date.now();
		s.pty?.resize(cols, rows);
	}
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

export function dismissSession(
	sessions: Map<string, Session>,
	id: string,
): boolean {
	const s = sessions.get(id);
	if (!s) return false;
	if (s.status !== "done") s.pty?.kill();
	clearIdle(s);
	s.activityWatcher?.close();
	if (s.cwd) removeActivity(s.cwd, s.id);
	sessions.delete(id);
	return true;
}
