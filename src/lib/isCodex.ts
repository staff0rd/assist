/**
 * Detects if assist is being executed by a Codex agent's shell tool.
 * Codex sets CODEX_TOOL_CALL_ID (and CODEX_THREAD_ID in some versions) on every command it runs.
 */
export function isCodex(): boolean {
	return (
		process.env.CODEX_TOOL_CALL_ID !== undefined ||
		process.env.CODEX_THREAD_ID !== undefined
	);
}
