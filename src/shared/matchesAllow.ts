import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

type PrefixMap = Map<string, string[]>;

let allowCache: PrefixMap | undefined;
let denyCache: PrefixMap | undefined;

/** @internal Reset caches — test-only. */
export function _resetCaches(): void {
	allowCache = undefined;
	denyCache = undefined;
}

const TOOL_RE = /^(Bash|PowerShell)\((.+?)(?::.*)\)$/;

function loadPrefixes(key: "allow" | "deny"): PrefixMap {
	const entries = collectEntries(key);
	return parsePrefixes(entries);
}

const SHELL_TOOLS = ["Bash", "PowerShell"];

/** Merge prefixes across all shell tools so one entry covers both Bash and PowerShell. */
function shellPrefixes(map: PrefixMap, toolName: string): string[] {
	if (SHELL_TOOLS.includes(toolName)) {
		return SHELL_TOOLS.flatMap((t) => map.get(t) ?? []);
	}
	return map.get(toolName) ?? [];
}

/** Check whether a command matches any allow rule for the given tool. */
export function matchesAllow(
	toolName: string,
	command: string,
): string | undefined {
	if (!allowCache) allowCache = loadPrefixes("allow");
	const prefixes = shellPrefixes(allowCache, toolName);
	return prefixes.find(
		(pfx) => command === pfx || command.startsWith(`${pfx} `),
	);
}

/** Check whether a command matches any deny rule for the given tool. */
export function matchesDeny(
	toolName: string,
	command: string,
): string | undefined {
	if (!denyCache) denyCache = loadPrefixes("deny");
	const prefixes = shellPrefixes(denyCache, toolName);
	return prefixes.find(
		(pfx) => command === pfx || command.startsWith(`${pfx} `),
	);
}

/** Collect permission entries from all settings layers. */
function collectEntries(key: "allow" | "deny"): string[] {
	const paths = [
		join(homedir(), ".claude", "settings.json"),
		join(process.cwd(), ".claude", "settings.json"),
		join(process.cwd(), ".claude", "settings.local.json"),
	];
	const entries: string[] = [];
	for (const p of paths) {
		entries.push(...readPermissionArray(p, key));
	}
	return entries;
}

/** Read a permissions array from a single JSON file. */
function readPermissionArray(
	filePath: string,
	key: "allow" | "deny",
): string[] {
	if (!existsSync(filePath)) return [];
	try {
		const data = JSON.parse(readFileSync(filePath, "utf-8"));
		const arr = data?.permissions?.[key];
		return Array.isArray(arr)
			? arr.filter((e: unknown) => typeof e === "string")
			: [];
	} catch {
		return [];
	}
}

/**
 * Extract command prefixes grouped by tool name.
 * `Bash(date:*)` → Map { "Bash" → ["date"] }
 * `PowerShell(git log:*)` → Map { "PowerShell" → ["git log"] }
 */
function parsePrefixes(entries: string[]): PrefixMap {
	const map: PrefixMap = new Map();
	for (const entry of entries) {
		const m = entry.match(TOOL_RE);
		if (m) {
			const tool = m[1];
			const prefix = m[2];
			const list = map.get(tool) ?? [];
			list.push(prefix);
			map.set(tool, list);
		}
	}
	return map;
}
