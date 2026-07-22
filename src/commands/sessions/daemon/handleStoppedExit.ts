import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";
import { refreshActivity } from "./watchActivity";

export function handleStoppedExit(
	session: Session,
	exitCode: number,
	onStatusChange: OnStatusChange,
): boolean {
	if (!session.stopping) return false;
	session.stopping = undefined;
	refreshActivity(session);
	daemonLog(
		`session ${session.id} ("${session.name}") pty exited (code ${exitCode}) after stop request; marking done`,
	);
	onStatusChange(session, "done", 0);
	return true;
}
