import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { singleLineTitle } from "./singleLineTitle";

export function setSessionTitle(
	sessions: Map<string, Session>,
	id: string,
	title: string,
): boolean {
	const normalised = singleLineTitle(title);
	const s = sessions.get(id);
	if (!s || !normalised) return false;
	s.title = normalised;
	daemonLog(`session ${id} renamed: ${normalised}`);
	return true;
}
