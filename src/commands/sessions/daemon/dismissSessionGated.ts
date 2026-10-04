import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { discardTree } from "./discardTree";
import { dismissSession } from "./dismissSession";
import { killPtyTree } from "./killPtyTree";
import { closeGateApplies } from "./worktree/closeGateApplies";
import { resolveCloseDurability } from "./worktree/resolveCloseDurability";
import { treeUnderClose } from "./worktree/treeUnderClose";

export function dismissSessionGated(
	sessions: Map<string, Session>,
	id: string,
	notify: () => void,
	discard = false,
): void {
	const s = sessions.get(id);
	const tree = s && treeUnderClose(s);
	if (!s || !tree || !closeGateApplies(sessions, s)) {
		if (dismissSession(sessions, id)) notify();
		return;
	}
	const removeCard = () => {
		if (dismissSession(sessions, id)) notify();
	};
	const settle = discard
		? () => void discardTree(s, removeCard, notify)
		: () => void resolveCloseDurability(s, removeCard, notify);
	s.closeGrace?.cancel();
	s.closing = true;
	daemonLog(
		`session ${id} closing: ${discard ? "discarding" : "checking durability of"} ${tree.path}`,
	);
	if (s.pty) {
		s.pendingDismiss = settle;
		daemonLog(
			`session ${id} ${discard ? "discard" : "dismiss"} requested: killing process tree first`,
		);
		killPtyTree(s.pty);
		notify();
		return;
	}
	notify();
	settle();
}
