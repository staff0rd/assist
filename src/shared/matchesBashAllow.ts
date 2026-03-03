import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** Cached allow prefixes — loaded once per process. */
let cached: string[] | undefined;

/**
 * Load `Bash(...)` allow rules from Claude Code settings files and
 * return the command prefixes (e.g. `["date", "git add", "gh pr list"]`).
 */
function loadBashAllowPrefixes(): string[] {
	if (cached) return cached;
	cached = parsePrefixes(collectAllowEntries());
	return cached;
}

/** Check whether a command matches any Bash allow rule. */
export function matchesBashAllow(command: string): string | undefined {
	const prefixes = loadBashAllowPrefixes();
	return prefixes.find(
		(pfx) => command === pfx || command.startsWith(`${pfx} `),
	);
}

/** Collect `permissions.allow` arrays from all settings layers. */
function collectAllowEntries(): string[] {
	const paths = [
		join(homedir(), ".claude", "settings.json"),
		join(process.cwd(), ".claude", "settings.json"),
		join(process.cwd(), ".claude", "settings.local.json"),
	];
	const entries: string[] = [];
	for (const p of paths) {
		entries.push(...readAllowArray(p));
	}
	return entries;
}

/** Read the `permissions.allow` array from a single JSON file. */
function readAllowArray(filePath: string): string[] {
	if (!existsSync(filePath)) return [];
	try {
		const data = JSON.parse(readFileSync(filePath, "utf-8"));
		const allow = data?.permissions?.allow;
		return Array.isArray(allow)
			? allow.filter((e: unknown) => typeof e === "string")
			: [];
	} catch {
		return [];
	}
}

/**
 * Extract command prefixes from Bash allow entries.
 * `Bash(date:*)` → `date`, `Bash(git add:*)` → `git add`.
 */
function parsePrefixes(entries: string[]): string[] {
	const re = /^Bash\((.+?)(?::.*)\)$/;
	const prefixes: string[] = [];
	for (const entry of entries) {
		const m = entry.match(re);
		if (m) prefixes.push(m[1]);
	}
	return prefixes;
}
