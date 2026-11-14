import { removeActivity } from "../../../shared/emitActivity";
import { releaseLock } from "../../backlog/acquireLock";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { killPtyTree } from "./killPtyTree";
import { reportUndeliveredPrompts } from "./reportUndeliveredPrompts";
import { stopSessionShellCommands } from "./shell/stopShellCommand";
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
	stopSessionShellCommands(s);
	s.activityWatcher?.close();
	s.transcriptWatcher?.close();
	s.gitWatcher?.close();
	s.closeGrace?.cancel();
	removeActivity(s.id);
	if (s.activity?.itemId != null) releaseLock(s.activity.itemId);
	reportUndeliveredPrompts(s, "dismissed");
	sessions.delete(id);
	daemonLog(`session ${id} dismissed (${s.name})`);
	if (!s.worktree) return true;
	if (sharedWith.length > 0)
		daemonLog(
			`worktree ${s.worktree.path} kept: still held by session(s) ${sharedWith.map((h) => h.id).join(", ")}`,
		);
	else void reapWorktree(s.worktree.path);
	return true;
}
