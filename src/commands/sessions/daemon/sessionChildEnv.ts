/* why: a daemon spawned from within a Claude Code session inherits
 * CLAUDE_CODE_CHILD_SESSION; left in the env it propagates to every claude the
 * session launches, marking them nested child sessions that never write a
 * resumable ~/.claude transcript — so resuming after a daemon restart fails
 * with "No conversation found" (#402). CLAUDECODE likewise would make every
 * session command believe it already runs inside Claude (e.g. `review
 * --high-level` skipping its own session). */
export function sessionChildEnv(
	base: Record<string, string | undefined>,
	sessionId?: string,
	extraEnv?: Record<string, string>,
): Record<string, string> {
	const {
		CLAUDE_CODE_CHILD_SESSION: _childSession,
		CLAUDECODE: _claudeCode,
		...parentEnv
	} = base;
	return {
		...parentEnv,
		ASSIST_SESSION: "1",
		...(sessionId && {
			ASSIST_SESSION_ID: sessionId,
			ASSIST_ACTIVITY_ID: sessionId,
		}),
		...extraEnv,
	} as Record<string, string>;
}
