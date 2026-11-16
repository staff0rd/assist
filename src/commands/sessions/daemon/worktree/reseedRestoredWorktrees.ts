import type { PortWaitDeps } from "../awaitServerPort";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { startHeldInTree } from "../startHeldInTree";
import { seedHeldSession } from "./seedHeldSession";

type HeldTree = { session: Session; clone: string };

export function reseedRestoredWorktrees(deps: PortWaitDeps): void {
	const { sessions, clients, onStatusChange, notify } = deps;
	for (const [path, { session, clone }] of heldTrees(sessions)) {
		daemonLog(
			`session ${session.id} ("${session.name}") restored mid worktree setup; re-seeding ${path} before starting it`,
		);
		seedHeldSession(session, path, clone, notify, (seeded, failure) =>
			startHeldInTree(
				seeded,
				sessions,
				clients,
				onStatusChange,
				notify,
				failure,
			),
		);
	}
}

function heldTrees(sessions: Map<string, Session>): Map<string, HeldTree> {
	const trees = new Map<string, HeldTree>();
	for (const session of sessions.values()) {
		const { worktree } = session;
		if (!session.awaitingSeed || !session.pendingStart || !worktree) continue;
		if (!trees.has(worktree.path))
			trees.set(worktree.path, { session, clone: worktree.clone });
	}
	return trees;
}
