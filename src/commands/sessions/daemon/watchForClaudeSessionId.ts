import type { Session } from "./createSession";
import { discoverClaudeSessionId } from "./discoverClaudeSessionId";

/**
 * Watch ~/.claude/projects until the session's claude sessionId appears,
 * then record it and invoke the callback so it gets persisted. Assist
 * sessions are watched too: commands like `assist draft` wrap claude, so
 * their conversations are resumable the same way.
 */
export function watchForClaudeSessionId(
	session: Session,
	sessions: Map<string, Session>,
	onDiscovered: () => void,
): void {
	if (session.commandType === "run" || !session.pty) return;
	void discoverClaudeSessionId({
		cwd: session.cwd ?? process.cwd(),
		sinceMs: session.startedAt,
		isClaimed: (sessionId) =>
			[...sessions.values()].some((s) => s.claudeSessionId === sessionId),
		isActive: () => {
			const s = sessions.get(session.id);
			return !!s && s.status !== "done";
		},
	}).then((sessionId) => {
		if (!sessionId || !sessions.has(session.id)) return;
		session.claudeSessionId = sessionId;
		onDiscovered();
	});
}
