import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { holdsNoCheckout } from "./worktree/holdsNoCheckout";
import { reapWorktree } from "./worktree/reapWorktree";
import { holdFailedDiscard } from "./holdFailedDiscard";
import { handOffUndeletableLeftover } from "./handOffUndeletableLeftover";

export async function discardTree(
	session: Session,
	discarded: () => void,
	notify: () => void,
): Promise<void> {
	leaveStoppedHold(session);
	const tree = session.worktree;
	if (tree) {
		const removal = await reapWorktree(tree.path, true);
		if (!session.worktree) {
			daemonLog(
				`session ${session.id} discard of ${tree.path} finished after the session was already closed elsewhere`,
			);
			return;
		}
		if (!removal.removed) {
			if (!holdsNoCheckout(tree.path)) {
				holdFailedDiscard(session, removal.reason, notify);
				return;
			}
			handOffUndeletableLeftover(session, removal);
			discarded();
			return;
		}
		session.releasedFromClone = session.worktree?.clone;
		session.worktree = undefined;
	}
	discarded();
}

function leaveStoppedHold(session: Session): void {
	if (!session.gitWatcher) return;
	daemonLog(
		`session ${session.id} discard: disarming the held-stopped git recheck before reaping`,
	);
	session.gitWatcher.close();
	session.gitWatcher = undefined;
	session.undurable = undefined;
}
