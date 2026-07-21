import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";

export function applySetStatus(
	sessions: Map<string, Session>,
	id: string,
	status: SessionStatus,
	source: string | undefined,
	onStatusChange: OnStatusChange,
): void {
	const session = sessions.get(id);
	if (!session) {
		daemonLog(
			`set-status for unknown session id=${id} status=${status} (no live session; ignoring)`,
		);
		return;
	}
	if (source === "permission") session.permissionActive = true;
	if (status === "running") session.permissionActive = false;
	onStatusChange(session, status);
}
