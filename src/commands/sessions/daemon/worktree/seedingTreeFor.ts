import { relative, isAbsolute } from "node:path";
import type { Session } from "../createSession";

export function seedingTreeFor(
	sessions: Map<string, Session>,
	cwd: string | undefined,
): Session | undefined {
	if (!cwd) return undefined;
	for (const session of sessions.values()) {
		const path = session.worktree?.path;
		if (!path || !session.awaitingSeed || !session.pendingStart) continue;
		const rel = relative(path, cwd);
		if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel)))
			return session;
	}
	return undefined;
}
