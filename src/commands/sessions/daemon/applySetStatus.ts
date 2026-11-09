import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";
import { markResumedOverPreview } from "./markResumedOverPreview";
import type { OnStatusChange } from "./types";
import { clearPendingSubmit } from "./watchSubmitOutcome";

function opensPrompt(status: SessionStatus, source: string | undefined) {
	const askUserQuestion = source === "pretool" && status === "waiting";
	return source === "permission" || askUserQuestion;
}

export function applySetStatus(
	sessions: Map<string, Session>,
	id: string,
	status: SessionStatus,
	source: string | undefined,
	onStatusChange: OnStatusChange,
	rebind?: (session: Session) => void,
): void {
	const session = sessions.get(id);
	if (!session) {
		daemonLog(
			`set-status for unknown session id=${id} status=${status} (no live session; ignoring)`,
		);
		return;
	}
	if (session.status === "stopped") {
		daemonLog(
			`set-status for stopped session id=${id} status=${status} (held pending durable close; ignoring)`,
		);
		return;
	}
	rebind?.(session);
	clearPendingSubmit(session);
	if (opensPrompt(status, source)) session.permissionActive = true;
	if (status === "running" || source === "stop")
		session.permissionActive = false;
	if (status === "running") markResumedOverPreview(session);
	onStatusChange(session, status);
}
