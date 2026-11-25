import { type Session } from "./createSession";
import { errorSession } from "./errorSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreBase } from "./restoreBase";
import { detectExistingWorktree } from "./worktree/detectExistingWorktree";
import { createHeld } from "./createHeld";

export function relaunchHeldSession(
	id: string,
	persisted: PersistedSession,
): Session {
	const worktree = detectExistingWorktree(persisted.cwd);
	if (!worktree)
		return errorSession(
			id,
			persisted,
			`not restored: its worktree ${persisted.cwd} was still being prepared when the daemon restarted and is no longer there`,
		);
	const created = createHeld(id, persisted);
	if (!created)
		return errorSession(
			id,
			persisted,
			`not restored: it was still preparing its worktree ${persisted.cwd} when the daemon restarted and has no launch to relaunch`,
		);
	const base = restoreBase(id, persisted);
	return {
		...base,
		...created,
		name: base.name,
		title: base.title,
		subtitle: base.subtitle,
		worktree,
		awaitingSeed: true,
	};
}
