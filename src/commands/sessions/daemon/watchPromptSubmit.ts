import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";

type OnStatusChange = (session: Session, status: SessionStatus) => void;

const CARRIAGE_RETURN = "\r";

function isPromptSubmit(data: string): boolean {
	return data.includes(CARRIAGE_RETURN);
}

export function watchPromptSubmit(
	session: Session,
	data: string,
	onStatusChange: OnStatusChange,
): void {
	if (session.restored !== true) return;
	if (session.status !== "waiting") return;
	if (!isPromptSubmit(data)) return;
	daemonLog(`session ${session.id} resumed-prompt submit -> running`);
	onStatusChange(session, "running");
}
