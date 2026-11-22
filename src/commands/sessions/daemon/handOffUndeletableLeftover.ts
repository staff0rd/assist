import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { markLeftover } from "./worktree/readWorktreeRegistry";

export function handOffUndeletableLeftover(
	session: Session,
	removal: { reason: string; deferred?: boolean },
): void {
	const path = session.worktree?.path;
	if (!path) return;
	markLeftover(path, removal.deferred ? removal.reason : undefined);
	daemonLog(
		`session ${session.id} discard could not delete ${path}, which holds no git checkout and so no work: ${removal.reason}; marked reaped so each daemon restart retries its removal, and the card is discarded`,
	);
	session.releasedFromClone = session.worktree?.clone;
	session.worktree = undefined;
}
