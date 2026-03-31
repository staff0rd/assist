import { readSettingsPerms } from "./readSettingsPerms";

type PermEntry = { command: string; wildcard: boolean };
type PermMap = Map<string, PermEntry[]>;

let allowCache: PermMap | undefined;
let denyCache: PermMap | undefined;

/** @internal Reset caches — test-only. */
export function _resetCaches(): void {
	allowCache = undefined;
	denyCache = undefined;
}

const TOOL_RE = /^(Bash|PowerShell)\((.+?)(:.*)?\)$/;
const SHELL_TOOLS = ["Bash", "PowerShell"];
const DOTSLASH_RE = /^\.[\\/]/;

function loadPerms(key: "allow" | "deny"): PermMap {
	return parsePerms(readSettingsPerms(key));
}

function shellEntries(map: PermMap, toolName: string): PermEntry[] {
	if (SHELL_TOOLS.includes(toolName)) {
		return SHELL_TOOLS.flatMap((t) => map.get(t) ?? []);
	}
	return map.get(toolName) ?? [];
}

function normCmd(cmd: string): string {
	return cmd.replace(DOTSLASH_RE, "");
}

function findMatch(entries: PermEntry[], command: string): string | undefined {
	const norm = normCmd(command);
	return entries.find((e) =>
		e.wildcard
			? norm === e.command || norm.startsWith(`${e.command} `)
			: norm === e.command,
	)?.command;
}

/** Check whether a command matches any allow rule for the given tool. */
export function matchesAllow(
	toolName: string,
	command: string,
): string | undefined {
	if (!allowCache) allowCache = loadPerms("allow");
	return findMatch(shellEntries(allowCache, toolName), command);
}

/** Check whether a command matches any deny rule for the given tool. */
export function matchesDeny(
	toolName: string,
	command: string,
): string | undefined {
	if (!denyCache) denyCache = loadPerms("deny");
	return findMatch(shellEntries(denyCache, toolName), command);
}

/**
 * Parse permission entries grouped by tool name.
 * `Bash(date:*)` → wildcard prefix match
 * `Bash(date)` → exact match only
 */
function parsePerms(entries: string[]): PermMap {
	const map: PermMap = new Map();
	for (const entry of entries) {
		const m = entry.match(TOOL_RE);
		if (m) {
			const tool = m[1];
			const command = normCmd(m[2]);
			const wildcard = m[3] !== undefined;
			const list = map.get(tool) ?? [];
			list.push({ command, wildcard });
			map.set(tool, list);
		}
	}
	return map;
}
