import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { awaitTreeVacated } from "./awaitTreeVacated";
import { closeBlockReason } from "./closeBlockReason";
import { reapWorktree } from "./reapWorktree";
import { treeUnderClose } from "./treeUnderClose";
import { holdStopped } from "./holdStopped";

export async function resolveCloseDurability(
	session: Session,
	finalize: () => void,
	notify: () => void,
	graceSpent = false,
): Promise<void> {
	const tree = treeUnderClose(session);
	if (!tree) {
		finalize();
		return;
	}
	const blocked = await closeBlockReason(session.id, tree);
	if (blocked?.live && session.closing && !graceSpent) {
		daemonLog(
			`session ${session.id} closing: waiting for live processes to leave ${tree.path} (${blocked.reason})`,
		);
		const outcome = await awaitTreeVacated(session, tree.path);
		daemonLog(`session ${session.id} closing: live-process wait ${outcome}`);
		if (outcome === "cancelled") return;
		return resolveCloseDurability(session, finalize, notify, true);
	}
	if (blocked) {
		holdStopped(
			session,
			tree,
			blocked.reason,
			() => resolveCloseDurability(session, finalize, notify),
			notify,
		);
		return;
	}
	if (tree.removable) await reapWorktree(tree.path);
	if (session.worktree) session.releasedFromClone = session.worktree.clone;
	session.worktree = undefined;
	session.undurable = undefined;
	session.closing = undefined;
	session.gitWatcher?.close();
	session.gitWatcher = undefined;
	finalize();
}
