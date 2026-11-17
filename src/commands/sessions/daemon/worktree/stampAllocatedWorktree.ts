import type { Session } from "../createSession";
import type { Allocation } from "./allocateTree";

export function stampAllocatedWorktree(
	session: Session,
	alloc: Allocation,
): Session {
	if (alloc.kind === "worktree" && alloc.cwd && alloc.clone)
		session.worktree = { path: alloc.cwd, clone: alloc.clone };
	return session;
}
