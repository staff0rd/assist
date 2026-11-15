import { parkedExitCode } from "../../backlog/parkedExitCode";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { isBacklogRunSession } from "./isBacklogRunSession";
import type { OnStatusChange } from "./types";

export function handleParkedExit(
	session: Session,
	exitCode: number,
	onStatusChange: OnStatusChange,
): boolean {
	if (exitCode !== parkedExitCode || !isBacklogRunSession(session))
		return false;
	daemonLog(
		`session ${session.id} ("${session.name}") parked: its parallel phases run in their own sessions; it wakes when they end`,
	);
	onStatusChange(session, "parked", exitCode);
	return true;
}
