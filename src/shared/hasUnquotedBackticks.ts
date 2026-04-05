/** Matches escape sequences, quoted strings, or a lone backtick. */
const QUOTED_OR_BACKTICK_RE = /\\.|'[^']*'|"[^"]*"|(`)/g;

export /**
 * Returns true when backticks appear outside of single- or double-quoted
 * strings.  Escaped backticks (\`) are considered literal and safe.
 */
function hasUnquotedBackticks(command: string): boolean {
	QUOTED_OR_BACKTICK_RE.lastIndex = 0;
	for (
		let m = QUOTED_OR_BACKTICK_RE.exec(command);
		m !== null;
		m = QUOTED_OR_BACKTICK_RE.exec(command)
	) {
		if (m[1] !== undefined) return true;
	}
	return false;
}
