import { clearPause, requestPause } from "../../backlog/consumePause";
import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";
import { watchEscInterrupt } from "./watchEscInterrupt";
import { watchPromptSubmit } from "./watchPromptSubmit";

export function writeToSession(
	sessions: Map<string, Session>,
	id: string,
	data: string,
	onStatusChange: (session: Session, status: SessionStatus) => void,
): void {
	const s = sessions.get(id);
	if (!s || s.status === "done") return;
	s.pty?.write(data);
	watchEscInterrupt(s, data, onStatusChange);
	watchPromptSubmit(s, data, onStatusChange);
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
	daemonLog(`session ${id} autorun ${enabled ? "on" : "off"}`);
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
	daemonLog(`session ${id} autoadvance ${enabled ? "on" : "off"}`);
	return true;
}
