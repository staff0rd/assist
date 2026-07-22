import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";

export function handleFailedResume(
	session: Session,
	exitCode: number,
	onStatusChange: OnStatusChange,
): boolean {
	const failed =
		session.restored === true &&
		exitCode !== 0 &&
		session.scrollback.length === 0;
	if (!failed) return false;
	session.error = `resume process exited with code ${exitCode} before producing any output`;
	daemonLog(
		`could not resume restored session "${session.name}" (id ${session.id}): ${session.error}`,
	);
	onStatusChange(session, "error", exitCode);
	return true;
}
