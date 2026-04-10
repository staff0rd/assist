import { resolve, sep } from "node:path";
import { isGhApiRead } from "./isGhApiRead";
import { findCliRead, findCliWrite } from "./loadCliReads";
import { matchesAllow } from "./matchesAllow";
import { readSettingsPerms } from "./readSettingsPerms";

const READ_RE = /^Read\((.+)\)$/;

/**
 * Check whether a single (non-compound) command is an approved read-only
 * operation. Returns a human-readable reason string when approved, or
 * `undefined` when the command is not recognised.
 */
const SAFE_BUILTINS = new Set(["true", "false"]);

export function isApprovedRead(
	command: string,
	toolName = "Bash",
): string | undefined {
	if (SAFE_BUILTINS.has(command)) return `safe shell builtin: ${command}`;

	if (isCdToCwd(command)) return "cd to current directory";

	const cdRead = isCdToReadAllowedDir(command);
	if (cdRead) return cdRead;

	const matchedRead = findCliRead(command);
	if (matchedRead) return `Read-only CLI command: ${matchedRead}`;

	const matchedWrite = findCliWrite(command);
	if (matchedWrite) return `Allowed CLI write: ${matchedWrite}`;

	if (isGhApiRead(command)) return "Read-only gh api command";

	const allowMatch = matchesAllow(toolName, command);
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
 * Check whether a `cd <path>` command targets a directory covered by a
 * `Read(...)` entry in the settings allow list. Returns a reason string
 * when approved, or `undefined` when not matched.
 */
function isCdToReadAllowedDir(command: string): string | undefined {
	const parts = command.split(/\s+/);
	if (parts[0] !== "cd" || parts.length !== 2) return undefined;

	const target = resolve(normalizeMsysPath(parts[1]));

	for (const entry of readSettingsPerms("allow")) {
		const m = entry.match(READ_RE);
		if (!m) continue;
		const base = globBaseDir(m[1]);
		if (!base) continue;
		const resolved = resolve(normalizeMsysPath(base));
		if (target === resolved || target.startsWith(resolved + sep)) {
			return `cd to Read-allowed directory: ${entry}`;
		}
	}

	return undefined;
}

/**
 * Strip trailing glob segments from a path pattern, returning the fixed
 * directory prefix. Returns an empty string when the whole pattern is a glob.
 */
function globBaseDir(pattern: string): string {
	const base = pattern.replace(/[/\\][^/\\]*[*?[].*$/, "");
	return /[*?[]/.test(base) ? "" : base;
}

/**
 * Convert MSYS/Git-Bash style paths (`/c/foo`) to Windows paths (`C:/foo`).
 * Passes non-MSYS paths through unchanged.
 */
function normalizeMsysPath(p: string): string {
	const m = p.match(/^\/([a-zA-Z])(\/.*)/);
	return m ? `${m[1].toUpperCase()}:${m[2]}` : p;
}
