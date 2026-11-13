import { daemonLog } from "./daemonLog";
import { isSdkSession } from "./isSdkSession";
import type { Session } from "./types";

export function skipsTerminalPath(session: Session, path: string): boolean {
	if (!isSdkSession(session)) return false;
	daemonLog(
		`session ${session.id} ${path} skipped: Claude (SDK) session has no terminal`,
	);
	return true;
}
