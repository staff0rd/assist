import { resolve } from "node:path";
import { isGhApiRead } from "./isGhApiRead";
import { findCliRead } from "./loadCliReads";
import { matchesBashAllow } from "./matchesBashAllow";

/**
 * Check whether a single (non-compound) command is an approved read-only
 * operation. Returns a human-readable reason string when approved, or
 * `undefined` when the command is not recognised.
 */
export function isApprovedRead(command: string): string | undefined {
	if (isCdToCwd(command)) return "cd to current directory";

	const matched = findCliRead(command);
	if (matched) return `Read-only CLI command: ${matched}`;

	if (isGhApiRead(command)) return "Read-only gh api command";

	const allowMatch = matchesBashAllow(command);
	if (allowMatch) return `Allowed by settings: ${allowMatch}`;

	return undefined;
}

/**
 * Returns true when the command is `cd` to the current working directory.
 * Handles bare `cd`, `cd .`, and absolute paths that resolve to cwd.
 */
function isCdToCwd(command: string): boolean {
	const parts = command.split(/\s+/);
	if (parts[0] !== "cd" || parts.length > 2) return false;

	// bare `cd` (goes to $HOME) — not cwd
	if (parts.length === 1) return false;

	const resolved = resolve(normalizeMsysPath(parts[1]));
	return resolved === resolve(process.cwd());
}

/**
 * Convert MSYS/Git-Bash style paths (`/c/foo`) to Windows paths (`C:/foo`).
 * Passes non-MSYS paths through unchanged.
 */
function normalizeMsysPath(p: string): string {
	const m = p.match(/^\/([a-zA-Z])(\/.*)/);
	return m ? `${m[1].toUpperCase()}:${m[2]}` : p;
}
