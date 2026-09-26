import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { setStatus } from "./setStatus";
import { reapWorktree } from "./worktree/reapWorktree";

export async function discardTree(
	session: Session,
	discarded: () => void,
	notify: () => void,
): Promise<void> {
	if (session.worktree) {
		const removal = await reapWorktree(session.worktree.path, true);
		if (!removal.removed) {
			holdFailedDiscard(session, removal.reason, notify);
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
