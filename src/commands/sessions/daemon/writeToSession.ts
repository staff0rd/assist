import { isSdkSession } from "./isSdkSession";
import { clearPause, requestPause } from "../../backlog/consumePause";
import type { Session, SessionStatus } from "./createSession";
import { claimViewer, type ViewerClaim } from "./claimViewer";
import { daemonLog } from "./daemonLog";
import { dropsInactiveViewerResponse } from "./dropsInactiveViewerResponse";
import { isTerminalResponse } from "./isTerminalResponse";
import { watchPromptSubmit } from "./watchPromptSubmit";
import { writeToSdkSession } from "./writeToSdkSession";

export function writeToSession(
	sessions: Map<string, Session>,
	id: string,
	data: string,
	onStatusChange: (session: Session, status: SessionStatus) => void,
	viewer: ViewerClaim = {},
): void {
	const s = sessions.get(id);
	if (!s || s.status === "done") return;
	if (isSdkSession(s)) return writeToSdkSession(s, data);
	const response = isTerminalResponse(data);
	if (dropsInactiveViewerResponse(s, response, viewer)) return;
	s.pty?.write(data);
	watchPromptSubmit(s, data, onStatusChange);
	if (!response) claimViewer(s, viewer, "input");
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

export function setAutoApprove(
	sessions: Map<string, Session>,
	id: string,
	enabled: boolean,
): boolean {
	const s = sessions.get(id);
	if (!s) return false;
	s.autoApprove = enabled;
	daemonLog(`session ${id} auto-approve ${enabled ? "on" : "off"}`);
	return true;
}
