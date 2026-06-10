import type { Session } from "./createSession";
import { watchClaudeSessionId } from "./watchClaudeSessionId";

/**
 * Watch ~/.claude/projects and keep the session's claude sessionId current:
 * adopt the first matching transcript, then follow it to newer transcripts as
 * the card's work moves to a new Claude session (e.g. a backlog item advancing
 * phase->phase), persisting each adoption via the callback. Assist sessions are
 * watched too: commands like `assist draft` wrap claude, so their conversations
 * are resumable the same way.
 */
export function watchForClaudeSessionId(
	session: Session,
	sessions: Map<string, Session>,
	onDiscovered: () => void,
): void {
	if (session.commandType === "run" || !session.pty) return;
	/* why: backlog runs assign and report their own exact per-phase session id via
	 * the activity channel (executePhase). The cwd-based poller below would race
	 * with concurrent runs in the same repo and clobber that id. */
	if (isBacklogRun(session)) return;
	void watchClaudeSessionId({
		cwd: session.cwd ?? process.cwd(),
		sinceMs: session.startedAt,
		isClaimed: (sessionId) =>
			[...sessions.values()].some((s) => s.claudeSessionId === sessionId),
		isActive: () => {
			const s = sessions.get(session.id);
			return !!s && s.status !== "done";
		},
		onSessionId: (sessionId) => {
			if (!sessions.has(session.id)) return;
			session.claudeSessionId = sessionId;
			onDiscovered();
		},
	});
}

function isBacklogRun(session: Session): boolean {
	return (
		session.commandType === "assist" &&
		session.assistArgs?.[0] === "backlog" &&
		session.assistArgs?.[1] === "run"
	);
}
