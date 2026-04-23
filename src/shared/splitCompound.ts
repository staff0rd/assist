import { parse } from "shell-quote";
import { groupByOperator } from "./groupByOperator";
import { hasUnquotedBackticks } from "./hasUnquotedBackticks";

type Tokens = ReturnType<typeof parse>;

type SplitResult = { ok: true; parts: string[] } | { ok: false; error: string };

/** Numeric fd-to-fd redirects like 2>&1 — safe plumbing. */
const FD_REDIRECT_RE = /\d+>&\d+/g;

/** Fd-to-/dev/null or PowerShell $null redirects like 2>/dev/null, 2>$null. */
const FD_DEVNULL_RE = /\d*>(?:\/dev\/null|\$null)/g;

const UNPARSEABLE = { ok: false, error: "unable to parse" } as const;

/**
 * Split a compound Bash command into its constituent simple commands.
 *
 * Returns `{ ok: true, parts }` with the trimmed sub-command strings on
 * success, or `{ ok: false, error }` when the command cannot be safely
 * decomposed (subshells, command substitution, backticks, unknown ops) or
 * when it contains a redirect whose target is outside the OS temp directory.
 */
export function splitCompound(command: string): SplitResult {
	const tokens = tokenizeCommand(command);
	if (!tokens) return UNPARSEABLE;

	const grouped = groupByOperator(tokens);
	if (!grouped.ok) return grouped;

	const parts = grouped.groups
		.map((g) => stripEnvPrefix(g).join(" "))
		.filter((cmd) => cmd !== "");

	if (parts.length === 0) return UNPARSEABLE;
	return { ok: true, parts };
}

function tokenizeCommand(command: string): Tokens | undefined {
	const trimmed = command
		.trim()
		.replace(FD_DEVNULL_RE, "")
		.replace(FD_REDIRECT_RE, "");
	if (!trimmed) return undefined;
	if (hasUnquotedBackticks(trimmed)) return undefined;
	try {
		return parse(trimmed);
	} catch {
		return undefined;
	}
}

function stripEnvPrefix(parts: string[]): string[] {
	let i = 0;
	while (i < parts.length && /^[A-Za-z_]\w*=/.test(parts[i])) i++;
	return i > 0 ? parts.slice(i) : parts;
}
