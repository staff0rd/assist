import type { parse } from "shell-quote";
import { handleToken } from "./handleToken";

type Tokens = ReturnType<typeof parse>;

type GroupResult =
	| { ok: true; groups: string[][] }
	| { ok: false; error: string };

/**
 * Group tokens into sub-command word arrays split on separator operators.
 * Strips output redirects when the target is under the OS temp directory, and
 * input redirects — including heredoc headers — regardless of source path.
 * Returns an error for unsafe operators, non-string tokens, or output redirects
 * pointing outside the OS temp directory.
 */
export function groupByOperator(tokens: Tokens): GroupResult {
	const groups: string[][] = [[]];
	for (let i = 0; i < tokens.length; i++) {
		const step = handleToken(tokens, i, groups);
		if (!step.ok) return step;
		i = step.nextIndex;
	}
	return { ok: true, groups };
}
