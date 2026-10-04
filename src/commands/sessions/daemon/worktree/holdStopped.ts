import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { setStatus } from "../setStatus";
import type { ClosingTree } from "./treeUnderClose";
import { watchGitState } from "./watchGitState";

export function holdStopped(
	session: Session,
	tree: ClosingTree,
	reason: string,
	recheck: () => Promise<void>,
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
			void recheck().finally(() => {
				rechecking = false;
			});
		});
	}
	notify();
}
