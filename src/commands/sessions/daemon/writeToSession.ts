import { clearPause, requestPause } from "../../backlog/consumePause";
import type { Session, SessionStatus } from "./createSession";
import { claimViewer, type ViewerClaim } from "./claimViewer";
import { daemonLog } from "./daemonLog";
import { watchPromptSubmit } from "./watchPromptSubmit";

export function writeToSession(
	sessions: Map<string, Session>,
	id: string,
	data: string,
	onStatusChange: (session: Session, status: SessionStatus) => void,
	viewer: ViewerClaim = {},
): void {
	const s = sessions.get(id);
	if (!s || s.status === "done") return;
	s.pty?.write(data);
	watchPromptSubmit(s, data, onStatusChange);
	claimViewer(s, viewer, "input");
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

export function setStarred(
	sessions: Map<string, Session>,
	id: string,
	starred: boolean,
): boolean {
	const s = sessions.get(id);
	if (!s) return false;
	s.starred = starred;
	daemonLog(`session ${id} starred ${starred ? "on" : "off"}`);
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
