import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { setStatus } from "./setStatus";
import { holdsNoCheckout } from "./worktree/holdsNoCheckout";
import { reapWorktree } from "./worktree/reapWorktree";

export async function discardTree(
	session: Session,
	discarded: () => void,
	notify: () => void,
): Promise<void> {
	if (session.worktree) {
		const removal = await reapWorktree(session.worktree.path, true);
		if (!removal.removed) {
			if (holdsNoCheckout(session.worktree.path))
				releaseUndeletableLeftover(session, removal.reason, notify);
			else holdFailedDiscard(session, removal.reason, notify);
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

function releaseUndeletableLeftover(
	session: Session,
	reason: string,
	notify: () => void,
): void {
	const path = session.worktree?.path;
	daemonLog(
		`session ${session.id} discard could not delete ${path}, which holds no git checkout and so no work: ${reason}; card released to error so it can be dismissed`,
	);
	const message = `Discard could not delete ${path}: ${reason}`;
	if (session.worktree) session.releasedFromClone = session.worktree.clone;
	session.worktree = undefined;
	session.closing = undefined;
	session.undurable = undefined;
	session.error = message;
	session.subtitle = message;
	session.scrollback += `\r\n\x1b[31m${message}\x1b[0m\r\n`;
	setStatus(session, "error");
	notify();
}
