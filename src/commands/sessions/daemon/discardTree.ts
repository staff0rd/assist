import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { setStatus } from "./setStatus";
import { holdsNoCheckout } from "./worktree/holdsNoCheckout";
import { markLeftover } from "./worktree/readWorktreeRegistry";
import { reapWorktree } from "./worktree/reapWorktree";

export async function discardTree(
	session: Session,
	discarded: () => void,
	notify: () => void,
): Promise<void> {
	if (session.worktree) {
		const removal = await reapWorktree(session.worktree.path, true);
		if (!removal.removed) {
			if (!holdsNoCheckout(session.worktree.path)) {
				holdFailedDiscard(session, removal.reason, notify);
				return;
			}
			handOffUndeletableLeftover(session, removal);
			discarded();
			return;
		}
		session.releasedFromClone = session.worktree.clone;
		session.worktree = undefined;
	}
	discarded();
}

function holdFailedDiscard(
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

function handOffUndeletableLeftover(
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
