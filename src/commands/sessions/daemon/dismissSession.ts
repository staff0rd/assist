import { removeActivity } from "../../../shared/emitActivity";
import { releaseLock } from "../../backlog/acquireLock";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { killPtyTree } from "./killPtyTree";
import { orphanedWatcherFor } from "./worktree/orphanedWatcherFor";
import { otherTreeHolders } from "./worktree/otherTreeHolders";
import { reapWorktree } from "./worktree/reapWorktree";

export function dismissSession(
	sessions: Map<string, Session>,
	id: string,
): boolean {
	const s = sessions.get(id);
	if (!s) return false;
	const sharedWith = otherTreeHolders(sessions, s);
	if (s.status !== "done" && s.pty) killPtyTree(s.pty);
	s.activityWatcher?.close();
	s.transcriptWatcher?.close();
	s.gitWatcher?.close();
	removeActivity(s.id);
	if (s.activity?.itemId != null) releaseLock(s.activity.itemId);
	sessions.delete(id);
	daemonLog(`session ${id} dismissed (${s.name})`);
	const orphan = orphanedWatcherFor(sessions, s);
	if (orphan) {
		daemonLog(
			`reaping watcher session ${orphan.watcher.id} for the clone ${orphan.clone}: its last session ${id} was dismissed`,
		);
		dismissSession(sessions, orphan.watcher.id);
	}
	if (!s.worktree) return true;
	if (sharedWith.length > 0)
		daemonLog(
			`worktree ${s.worktree.path} kept: still held by session(s) ${sharedWith.map((h) => h.id).join(", ")}`,
		);
	else void reapWorktree(s.worktree.path);
	return true;
}
