import { duplicateRunExitCode } from "../../backlog/duplicateRunExitCode";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";

export function handleRefusedRun(
	session: Session,
	exitCode: number,
	onStatusChange: OnStatusChange,
): boolean {
	if (exitCode !== duplicateRunExitCode) return false;
	session.error = session.restored
		? "not resumed: the original backlog run is still alive (orphaned by a daemon restart); stop it before restarting this session"
		: "refused: another session is already running this backlog item";
	daemonLog(
		`session ${session.id} ("${session.name}") duplicate backlog run refused; keeping its worktree for the live original: ${session.error}`,
	);
	onStatusChange(session, "error", exitCode);
	return true;
}
