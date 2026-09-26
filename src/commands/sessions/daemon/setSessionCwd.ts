import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { detectExistingWorktree } from "./worktree/detectExistingWorktree";

export function setSessionCwd(
	sessions: Map<string, Session>,
	id: string,
	cwd: string,
): boolean {
	const s = sessions.get(id);
	if (!s || !cwd || s.cwd === cwd) return false;
	const from = s.cwd;
	s.cwd = cwd;
	s.worktree = detectExistingWorktree(cwd);
	s.releasedFromClone = undefined;
	daemonLog(
		`session ${id} cwd moved: ${from ?? "(none)"} -> ${cwd}${s.worktree ? ` (bound worktree of ${s.worktree.clone})` : ""}`,
	);
	return true;
}
