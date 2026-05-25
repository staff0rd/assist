/**
 * Encode an absolute working directory into the directory name Claude Code
 * uses under `~/.claude/projects/`. Path separators (`/`, `\`) and dots
 * are replaced with `-`. Example:
 *   /home/me/git/foo/.claude → -home-me-git-foo--claude
 */
export function encodeCwdForProjects(cwd: string): string {
	return cwd.replace(/[\\/.]/g, "-");
}
