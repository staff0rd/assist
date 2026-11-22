import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { setStatus } from "./setStatus";

export function holdFailedDiscard(
	session: Session,
	reason: string,
	notify: () => void,
): void {
	daemonLog(
		`session ${session.id} discard failed for ${session.worktree?.path}: ${reason}; card kept so the workspace is not orphaned invisibly`,
	);
	session.closing = undefined;
	session.undurable = {
		reason: `discard failed: ${reason}`,
		removesTree: true,
	};
	setStatus(session, "stopped");
	notify();
}
