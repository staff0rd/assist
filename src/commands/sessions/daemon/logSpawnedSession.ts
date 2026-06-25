import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function logSpawnedSession(session: Session): void {
	daemonLog(
		`session ${session.id} spawned: ${session.name} [${session.commandType}] ${session.cwd ?? ""}`,
	);
}
