/**
 * Detects if assist is being executed by Claude Code.
 * Claude Code sets the CLAUDECODE environment variable when running commands.
 */
export function isClaudeCode(): boolean {
	return process.env.CLAUDECODE !== undefined;
}
