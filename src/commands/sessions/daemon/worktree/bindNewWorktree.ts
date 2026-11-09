import type { Session } from "../createSession";
import type { Allocation } from "./allocateTree";
import { detectExistingWorktree } from "./detectExistingWorktree";
import { noteWorktreeHarness } from "./noteWorktreeHarness";
import { seedWorktree } from "./seedWorktree";
import { refuseUnallocatedStart } from "./refuseUnallocatedStart";

export function bindNewWorktree(
	session: Session | undefined,
	alloc: Allocation,
	notify: () => void,
	startHeld: (session: Session) => void = () => {},
): void {
	if (alloc.kind !== "worktree" || !alloc.cwd || !alloc.clone || !session)
		return;
	session.worktree = { path: alloc.cwd, clone: alloc.clone };
	noteWorktreeHarness(session);
	if (alloc.created) {
		session.awaitingSeed = true;
		const { cwd, clone } = alloc;
		void (alloc.ready ?? Promise.resolve()).then(
			() => seedHeldSession(session, cwd, clone, notify, startHeld),
			(error) => refuseUnallocatedStart(session, cwd, error, startHeld),
		);
	}
	notify();
}

export function seedHeldSession(
	session: Session,
	path: string,
	clone: string,
	notify: () => void,
	startHeld: (session: Session) => void,
): void {
	seedWorktree(
		path,
		clone,
		() => {
			session.seeding = undefined;
			startHeld(session);
		},
		(installPath) => {
			session.seeding = `Installing dependencies${installPath ? ` in ${installPath}` : ""}…`;
			notify();
		},
	);
}

export function bindRestoredWorktrees(sessions: Map<string, Session>): void {
	for (const session of sessions.values()) {
		if (session.worktree || !session.cwd) continue;
		const worktree = detectExistingWorktree(session.cwd);
		if (worktree) session.worktree = worktree;
	}
}

export function bindResumedWorktree(
	session: Session | undefined,
	cwd: string,
	notify: () => void,
): void {
	if (!session) return;
	const worktree = detectExistingWorktree(cwd);
	if (!worktree) return;
	session.worktree = worktree;
	notify();
}
