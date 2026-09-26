import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { setStatus } from "../setStatus";
import { reapWorktree } from "./reapWorktree";
import { checkDurability } from "./treeDurability";
import { type ClosingTree, treeUnderClose } from "./treeUnderClose";
import { watchGitState } from "./watchGitState";

export async function resolveCloseDurability(
	session: Session,
	finalize: () => void,
	notify: () => void,
): Promise<void> {
	const tree = treeUnderClose(session);
	if (!tree) {
		finalize();
		return;
	}
	const durability = await checkDurability(tree.path);
	if (!durability.durable) {
		holdStopped(session, tree, durability.reason, finalize, notify);
		return;
	}
	if (durability.gone)
		daemonLog(
			`session ${session.id} closing: worktree ${tree.path} is gone from disk — released with nothing to land, not landed work`,
		);
	if (tree.removable) await reapWorktree(tree.path);
	if (session.worktree) session.releasedFromClone = session.worktree.clone;
	session.worktree = undefined;
	session.undurable = undefined;
	session.closing = undefined;
	session.gitWatcher?.close();
	session.gitWatcher = undefined;
	finalize();
}

function holdStopped(
	session: Session,
	tree: ClosingTree,
	reason: string,
	finalize: () => void,
	notify: () => void,
): void {
	if (session.undurable?.reason !== reason)
		daemonLog(
			`session ${session.id} stopped; ${tree.removable ? "reap" : "close"} blocked in ${tree.path}: ${reason}`,
		);
	session.undurable = { reason, removesTree: tree.removable };
	session.closing = undefined;
	setStatus(session, "stopped");
	if (!session.gitWatcher) {
		let rechecking = false;
		session.gitWatcher = watchGitState(tree.path, () => {
			if (session.status !== "stopped" || rechecking) return;
			rechecking = true;
			void resolveCloseDurability(session, finalize, notify).finally(() => {
				rechecking = false;
			});
		});
	}
	notify();
}
