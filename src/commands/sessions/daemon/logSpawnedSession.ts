import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function logSpawnedSession(session: Session): void {
	const launchedFrom = session.launchedFrom
		? ` launched from ${session.launchedFrom}`
		: "";
	const autoApprove = session.autoApprove ? " auto-approve" : "";
	daemonLog(
		`session ${session.id} spawned: ${session.name} [${session.commandType}] ${session.cwd ?? ""}${launchedFrom}${autoApprove}`,
	);
}
