import { parse } from "shell-quote";

type Tokens = ReturnType<typeof parse>;
type Token = Tokens[number];

/** Operators that separate independent sub-commands. */
const SEPARATOR_OPS = new Set(["|", "&&", "||", ";"]);

/** Operators that indicate constructs we cannot safely analyse. */
const UNSAFE_OPS = new Set(["(", ")", ">", ">>", "<", "<&", "|&", ">&"]);

/** Numeric fd-to-fd redirects like 2>&1 — safe plumbing. */
const FD_REDIRECT_RE = /\d+>&\d+/g;

/** Fd-to-/dev/null redirects like 2>/dev/null — safe plumbing (just discards output). */
const FD_DEVNULL_RE = /\d*>\/dev\/null/g;

/**
 * Split a compound Bash command into its constituent simple commands.
 *
 * Returns an array of trimmed command strings, or `undefined` when the
 * command cannot be safely decomposed (e.g. redirections, subshells,
 * command substitution, backticks).
 */
export function splitCompound(command: string): string[] | undefined {
	const tokens = tokenizeCommand(command);
	if (!tokens) return undefined;

	const groups = groupByOperator(tokens);
	if (!groups) return undefined;

	const result = groups
		.map((parts) => stripEnvPrefix(parts).join(" "))
		.filter((cmd) => cmd !== "");

	return result.length > 0 ? result : undefined;
}

/** Parse command string into shell-quote tokens, or undefined on failure. */
function tokenizeCommand(command: string): Tokens | undefined {
	const trimmed = command
		.trim()
		.replace(FD_DEVNULL_RE, "")
		.replace(FD_REDIRECT_RE, "");
	if (!trimmed) return undefined;

	try {
		const tokens = parse(trimmed);
		const hasBacktick = tokens.some(
			(t) => typeof t === "string" && /`.+`/.test(t),
		);
		return hasBacktick ? undefined : tokens;
	} catch {
		return undefined;
	}
}

/** Extract the operator string from a token, or undefined for non-operators. */
function getOp(token: Token): string | undefined {
	return typeof token === "object" && token !== null && "op" in token
		? (token as { op: string }).op
		: undefined;
}

/**
 * Group tokens into sub-command word arrays split on separator operators.
 * Returns undefined for any unsafe operator or non-string token.
 */
function groupByOperator(tokens: Tokens): string[][] | undefined {
	const groups: string[][] = [[]];

	for (const token of tokens) {
		const op = getOp(token);
		if (op === undefined) {
			if (typeof token !== "string") return undefined;
			groups[groups.length - 1].push(token);
		} else if (SEPARATOR_OPS.has(op)) {
			groups.push([]);
		} else if (UNSAFE_OPS.has(op)) {
			return undefined;
		} else {
			return undefined;
		}
	}

	return groups;
}

/** Strip leading `KEY=value` env-var assignments (e.g. `NODE_ENV=prod npm test` → `npm test`). */
function stripEnvPrefix(parts: string[]): string[] {
	let i = 0;
	while (i < parts.length && /^[A-Za-z_]\w*=/.test(parts[i])) i++;
	return i > 0 ? parts.slice(i) : parts;
}
